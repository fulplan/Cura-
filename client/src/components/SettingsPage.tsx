import { useState } from "react";
import { Save, Globe, Shield, Bell, Database, Palette, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageToolbar, 
  PageBody, 
  ActionBar
} from "@/components/ui/page";

interface SettingsPageProps {
  onSave?: (settings: any) => void;
}

export default function SettingsPage({ 
  onSave = (settings) => console.log("Save settings:", settings)
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [isDirty, setIsDirty] = useState(false);
  const [settings, setSettings] = useState({
    // General
    siteName: "Penkora CMS",
    siteDescription: "A modern content management system",
    siteUrl: "https://penkora.com",
    timezone: "UTC",
    language: "en",
    
    // SEO
    metaTitle: "Penkora - Content Management System",
    metaDescription: "Manage your content with ease using Penkora CMS",
    
    // Email
    emailProvider: "smtp",
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "noreply@penkora.com",
    fromName: "Penkora",
    
    // Security
    enableTwoFactor: false,
    sessionTimeout: "24",
    passwordMinLength: "8",
    enableLoginAttempts: true,
    maxLoginAttempts: "5",
    
    // Notifications
    emailNotifications: true,
    browserNotifications: false,
    digestEmail: true,
    securityAlerts: true,
    
    // Content
    defaultPostStatus: "draft",
    enableComments: true,
    moderateComments: true,
    allowRegistration: false,
    defaultUserRole: "subscriber"
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(settings);
    setIsDirty(false);
  };

  const GeneralTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => updateSetting("siteName", e.target.value)}
              data-testid="site-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => updateSetting("siteDescription", e.target.value)}
              className="h-20"
              data-testid="site-description"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteUrl">Site URL</Label>
            <Input
              id="siteUrl"
              type="url"
              value={settings.siteUrl}
              onChange={(e) => updateSetting("siteUrl", e.target.value)}
              data-testid="site-url"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => updateSetting("timezone", value)}>
                <SelectTrigger data-testid="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                <SelectTrigger data-testid="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Authentication & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require additional verification for logins
              </p>
            </div>
            <Switch
              checked={settings.enableTwoFactor}
              onCheckedChange={(checked) => updateSetting("enableTwoFactor", checked)}
              data-testid="two-factor-toggle"
            />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting("sessionTimeout", e.target.value)}
                data-testid="session-timeout"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => updateSetting("passwordMinLength", e.target.value)}
                data-testid="password-min-length"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Login Attempt Limiting</Label>
              <p className="text-sm text-muted-foreground">
                Block users after failed login attempts
              </p>
            </div>
            <Switch
              checked={settings.enableLoginAttempts}
              onCheckedChange={(checked) => updateSetting("enableLoginAttempts", checked)}
              data-testid="login-attempts-toggle"
            />
          </div>
          
          {settings.enableLoginAttempts && (
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting("maxLoginAttempts", e.target.value)}
                className="max-w-32"
                data-testid="max-login-attempts"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              data-testid="email-notifications-toggle"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications in your browser
              </p>
            </div>
            <Switch
              checked={settings.browserNotifications}
              onCheckedChange={(checked) => updateSetting("browserNotifications", checked)}
              data-testid="browser-notifications-toggle"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly summary emails
              </p>
            </div>
            <Switch
              checked={settings.digestEmail}
              onCheckedChange={(checked) => updateSetting("digestEmail", checked)}
              data-testid="digest-email-toggle"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about security events
              </p>
            </div>
            <Switch
              checked={settings.securityAlerts}
              onCheckedChange={(checked) => updateSetting("securityAlerts", checked)}
              data-testid="security-alerts-toggle"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const EmailTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailProvider">Email Provider</Label>
            <Select value={settings.emailProvider} onValueChange={(value) => updateSetting("emailProvider", value)}>
              <SelectTrigger data-testid="email-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smtp">SMTP</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="ses">AWS SES</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {settings.emailProvider === "smtp" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting("smtpHost", e.target.value)}
                    placeholder="smtp.gmail.com"
                    data-testid="smtp-host"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting("smtpPort", e.target.value)}
                    placeholder="587"
                    data-testid="smtp-port"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.smtpUsername}
                    onChange={(e) => updateSetting("smtpUsername", e.target.value)}
                    data-testid="smtp-username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => updateSetting("smtpPassword", e.target.value)}
                    data-testid="smtp-password"
                  />
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={settings.fromEmail}
                onChange={(e) => updateSetting("fromEmail", e.target.value)}
                data-testid="from-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={settings.fromName}
                onChange={(e) => updateSetting("fromName", e.target.value)}
                data-testid="from-name"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Page data-testid="settings-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle>
              Settings
            </PageTitle>
            <div className="hidden md:flex items-center gap-2">
              {isDirty && (
                <Button onClick={handleSave} data-testid="save-settings-desktop">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </PageToolbar>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        {/* Mobile Tabs */}
        <div className="md:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <GeneralTab />
            </TabsContent>
            
            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
            
            <TabsContent value="email">
              <EmailTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <GeneralTab />
            </TabsContent>
            
            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
            
            <TabsContent value="email">
              <EmailTab />
            </TabsContent>
          </Tabs>
        </div>
      </PageBody>

      {/* Mobile Action Bar */}
      <ActionBar show={isDirty}>
        <span className="text-sm">Unsaved changes</span>
        <Button onClick={handleSave} size="sm" data-testid="save-settings-mobile">
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </ActionBar>
    </Page>
  );
}