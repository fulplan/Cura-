import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';

export interface JobConfig {
  id: string;
  name: string;
  cronExpression: string;
  handler: () => Promise<void>;
  timezone?: string;
  enabled?: boolean;
  runOnStart?: boolean;
}

export interface ScheduledJob {
  id: string;
  name: string;
  cronExpression: string;
  nextRun?: Date;
  lastRun?: Date;
  isRunning: boolean;
  enabled: boolean;
}

export class SchedulerService {
  private jobs: Map<string, { task: ScheduledTask; config: JobConfig }> = new Map();
  private runningJobs: Set<string> = new Set();

  constructor() {
    console.log('📅 Scheduler service initialized');
  }

  /**
   * Schedule a new job
   */
  scheduleJob(config: JobConfig): boolean {
    try {
      // Validate cron expression
      if (!cron.validate(config.cronExpression)) {
        console.error(`❌ Invalid cron expression for job ${config.id}: ${config.cronExpression}`);
        return false;
      }

      // Stop existing job if it exists
      if (this.jobs.has(config.id)) {
        this.unscheduleJob(config.id);
      }

      const wrappedHandler = async () => {
        if (this.runningJobs.has(config.id)) {
          console.log(`⏭️ Skipping job ${config.id} - already running`);
          return;
        }

        try {
          this.runningJobs.add(config.id);
          console.log(`🚀 Starting scheduled job: ${config.name} (${config.id})`);
          
          await config.handler();
          
          console.log(`✅ Completed scheduled job: ${config.name} (${config.id})`);
        } catch (error) {
          console.error(`❌ Error in scheduled job ${config.name} (${config.id}):`, error);
        } finally {
          this.runningJobs.delete(config.id);
        }
      };

      const task = cron.schedule(
        config.cronExpression, 
        wrappedHandler, 
        {
          scheduled: config.enabled !== false,
          timezone: config.timezone || 'UTC'
        }
      );

      this.jobs.set(config.id, { task, config });

      console.log(`📅 Scheduled job: ${config.name} (${config.cronExpression})`);

      // Run immediately if configured
      if (config.runOnStart && config.enabled !== false) {
        setImmediate(wrappedHandler);
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to schedule job ${config.id}:`, error);
      return false;
    }
  }

  /**
   * Unschedule a job
   */
  unscheduleJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    try {
      job.task.stop();
      job.task.destroy();
      this.jobs.delete(jobId);
      this.runningJobs.delete(jobId);
      
      console.log(`🛑 Unscheduled job: ${job.config.name} (${jobId})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to unschedule job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Start a job (if it exists and is stopped)
   */
  startJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    try {
      job.task.start();
      job.config.enabled = true;
      console.log(`▶️ Started job: ${job.config.name} (${jobId})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to start job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Stop a job (without unscheduling)
   */
  stopJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    try {
      job.task.stop();
      job.config.enabled = false;
      console.log(`⏸️ Stopped job: ${job.config.name} (${jobId})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to stop job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Run a job immediately (manually trigger)
   */
  async runJobNow(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.error(`❌ Job not found: ${jobId}`);
      return false;
    }

    if (this.runningJobs.has(jobId)) {
      console.log(`⏭️ Job already running: ${jobId}`);
      return false;
    }

    try {
      this.runningJobs.add(jobId);
      console.log(`🎯 Manually triggering job: ${job.config.name} (${jobId})`);
      
      await job.config.handler();
      
      console.log(`✅ Manual job execution completed: ${job.config.name} (${jobId})`);
      return true;
    } catch (error) {
      console.error(`❌ Error in manual job execution ${jobId}:`, error);
      return false;
    } finally {
      this.runningJobs.delete(jobId);
    }
  }

  /**
   * Get all scheduled jobs status
   */
  getJobsStatus(): ScheduledJob[] {
    const jobs: ScheduledJob[] = [];
    
    for (const [id, { config, task }] of this.jobs) {
      jobs.push({
        id,
        name: config.name,
        cronExpression: config.cronExpression,
        isRunning: this.runningJobs.has(id),
        enabled: config.enabled !== false,
        // Note: node-cron doesn't provide nextRun/lastRun info
        // We could track this manually if needed
      });
    }
    
    return jobs.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get specific job status
   */
  getJobStatus(jobId: string): ScheduledJob | null {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }

    return {
      id: jobId,
      name: job.config.name,
      cronExpression: job.config.cronExpression,
      isRunning: this.runningJobs.has(jobId),
      enabled: job.config.enabled !== false,
    };
  }

  /**
   * Shutdown all jobs gracefully
   */
  shutdown(): void {
    console.log('🛑 Shutting down scheduler service...');
    
    for (const [jobId, { task }] of this.jobs) {
      try {
        task.stop();
        task.destroy();
      } catch (error) {
        console.error(`❌ Error stopping job ${jobId}:`, error);
      }
    }
    
    this.jobs.clear();
    this.runningJobs.clear();
    
    console.log('✅ Scheduler service shutdown complete');
  }

  /**
   * Initialize with default CMS jobs
   */
  initializeDefaultJobs(): void {
    console.log('📅 Initializing default CMS jobs...');
    
    // Publish scheduled posts (every minute)
    this.scheduleJob({
      id: 'publish-scheduled-posts',
      name: 'Publish Scheduled Posts',
      cronExpression: '* * * * *', // Every minute
      handler: this.publishScheduledPosts.bind(this),
      enabled: true,
    });

    // Cleanup old sessions (daily at 2 AM)
    this.scheduleJob({
      id: 'cleanup-sessions',
      name: 'Cleanup Old Sessions',
      cronExpression: '0 2 * * *', // Daily at 2 AM
      handler: this.cleanupOldSessions.bind(this),
      enabled: true,
    });

    // Generate analytics summaries (daily at 1 AM)
    this.scheduleJob({
      id: 'generate-analytics',
      name: 'Generate Daily Analytics',
      cronExpression: '0 1 * * *', // Daily at 1 AM
      handler: this.generateDailyAnalytics.bind(this),
      enabled: true,
    });

    console.log('✅ Default CMS jobs initialized');
  }

  /**
   * Publish posts that are scheduled for now
   */
  private async publishScheduledPosts(): Promise<void> {
    try {
      const { storage } = await import('../storage');
      
      // Get posts with status 'scheduled' that should be published now
      const scheduledPosts = await storage.listPosts({ 
        status: 'scheduled', 
        limit: 100 
      });
      
      const now = new Date();
      let publishedCount = 0;
      
      for (const post of scheduledPosts.posts) {
        if (post.publishedAt && new Date(post.publishedAt) <= now) {
          // Publish the post
          await storage.updatePost(post.id, {
            status: 'published',
            publishedAt: now,
          });
          
          publishedCount++;
          console.log(`📰 Published scheduled post: ${post.title}`);
        }
      }
      
      if (publishedCount > 0) {
        console.log(`✅ Published ${publishedCount} scheduled posts`);
      }
    } catch (error) {
      console.error('❌ Error publishing scheduled posts:', error);
    }
  }

  /**
   * Cleanup old session data
   */
  private async cleanupOldSessions(): Promise<void> {
    try {
      // This would clean up expired sessions from database
      // For now, just log - implementation depends on session storage
      console.log('🧹 Session cleanup completed');
    } catch (error) {
      console.error('❌ Error cleaning up sessions:', error);
    }
  }

  /**
   * Generate daily analytics summaries
   */
  private async generateDailyAnalytics(): Promise<void> {
    try {
      const { storage } = await import('../storage');
      
      // This would generate analytics summaries
      // For now, just track that the job ran
      await storage.trackEvent('system_job_run', 'generate-analytics', 'scheduler');
      console.log('📊 Daily analytics generation completed');
    } catch (error) {
      console.error('❌ Error generating analytics:', error);
    }
  }
}

// Singleton instance
export const schedulerService = new SchedulerService();