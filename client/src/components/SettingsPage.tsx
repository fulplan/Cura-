import { useState, useEffect } from "react";
import { Save, Globe, Shield, Bell, Database, Palette, Users, Mail, CheckCircle, AlertCircle, Info, Loader2, UserCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  onSave = (settings) => {
    // Safe logging - exclude sensitive fields
    const { smtpPassword, ...safeSettings } = settings;
    console.log("Save settings (sensitive fields redacted):", safeSettings);
  }
}: SettingsPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileSettings, setProfileSettings] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
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
    setSaveSuccess(false);
    
    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const updateProfileSetting = (key: string, value: any) => {
    setProfileSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
    setSaveSuccess(false);
    
    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateSettings = () => {
    const errors: Record<string, string> = {};
    
    if (!settings.siteName.trim()) {
      errors.siteName = "Site name is required";
    }
    
    if (!settings.siteUrl.trim()) {
      errors.siteUrl = "Site URL is required";
    } else if (!/^https?:\/\/.+/.test(settings.siteUrl)) {
      errors.siteUrl = "Please enter a valid URL (starting with http:// or https://)";
    }
    
    if (!settings.fromEmail.trim()) {
      errors.fromEmail = "From email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.fromEmail)) {
      errors.fromEmail = "Please enter a valid email address";
    }
    
    if (parseInt(settings.passwordMinLength) < 8) {
      errors.passwordMinLength = "Minimum password length should be at least 8 characters";
    }
    
    return errors;
  };

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    
    if (!profileSettings.displayName.trim()) {
      errors.displayName = "Display name is required";
    }
    
    if (!profileSettings.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileSettings.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Password validation only if user is trying to change password
    if (profileSettings.newPassword || profileSettings.currentPassword || profileSettings.confirmPassword) {
      if (!profileSettings.currentPassword) {
        errors.currentPassword = "Current password is required to change password";
      }
      
      if (!profileSettings.newPassword) {
        errors.newPassword = "New password is required";
      } else if (profileSettings.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters long";
      }
      
      if (profileSettings.newPassword !== profileSettings.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    return errors;
  };

  const handleSave = async () => {
    // Call appropriate save function based on active tab
    if (activeTab === "profile") {
      await handleProfileSave();
    } else {
      await handleSiteSettingsSave();
    }
  };

  const handleSiteSettingsSave = async () => {
    const errors = validateSettings();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSaving(true);
    try {
      // Create a safe copy for logging (excluding sensitive fields)
      const { smtpPassword, ...safeSettings } = settings;
      console.log("Saving settings (sensitive fields redacted):", safeSettings);
      
      await onSave(settings);
      setIsDirty(false);
      setSaveSuccess(true);
      setValidationErrors({});
      
      toast({
        title: "Settings saved",
        description: "Your site settings have been updated successfully.",
      });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSave = async () => {
    const errors = validateProfile();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSaving(true);
    try {
      const updateData: any = {
        displayName: profileSettings.displayName,
        email: profileSettings.email
      };
      
      // Only include password fields if user is changing password
      if (profileSettings.newPassword) {
        updateData.currentPassword = profileSettings.currentPassword;
        updateData.newPassword = profileSettings.newPassword;
      }
      
      await apiRequest('PUT', '/api/auth/profile', updateData);
      
      // Clear password fields after successful update
      setProfileSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
      setIsDirty(false);
      setSaveSuccess(true);
      setValidationErrors({});
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save functionality (optional)
  useEffect(() => {
    if (!isDirty) return;
    
    const autoSaveTimer = setTimeout(() => {
      const errors = validateSettings();
      if (Object.keys(errors).length === 0) {
        // Auto-save only if no validation errors
        // handleSave(); // Uncomment to enable auto-save
      }
    }, 2000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [settings, isDirty]);

  const ProfileTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            User Profile
          </CardTitle>
          <CardDescription>
            Update your personal information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className={validationErrors.displayName ? "text-destructive" : ""}>
                Display Name
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="displayName"
                value={profileSettings.displayName}
                onChange={(e) => updateProfileSetting("displayName", e.target.value)}
                placeholder="Your display name"
                className={validationErrors.displayName ? "border-destructive focus:border-destructive" : ""}
                data-testid="input-display-name"
              />
              {validationErrors.displayName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.displayName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className={validationErrors.email ? "text-destructive" : ""}>
                Email Address
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={profileSettings.email}
                onChange={(e) => updateProfileSetting("email", e.target.value)}
                placeholder="your.email@example.com"
                className={validationErrors.email ? "border-destructive focus:border-destructive" : ""}
                data-testid="input-email"
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.email}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className={validationErrors.currentPassword ? "text-destructive" : ""}>
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={profileSettings.currentPassword}
                onChange={(e) => updateProfileSetting("currentPassword", e.target.value)}
                placeholder="Enter current password"
                className={validationErrors.currentPassword ? "border-destructive focus:border-destructive pr-10" : "pr-10"}
                data-testid="input-current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                data-testid="button-toggle-current-password"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {validationErrors.currentPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.currentPassword}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className={validationErrors.newPassword ? "text-destructive" : ""}>
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={profileSettings.newPassword}
                  onChange={(e) => updateProfileSetting("newPassword", e.target.value)}
                  placeholder="Enter new password"
                  className={validationErrors.newPassword ? "border-destructive focus:border-destructive pr-10" : "pr-10"}
                  data-testid="input-new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  data-testid="button-toggle-new-password"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {validationErrors.newPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.newPassword}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={validationErrors.confirmPassword ? "text-destructive" : ""}>
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={profileSettings.confirmPassword}
                  onChange={(e) => updateProfileSetting("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                  className={validationErrors.confirmPassword ? "border-destructive focus:border-destructive pr-10" : "pr-10"}
                  data-testid="input-confirm-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Leave password fields empty if you don't want to change your password.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );

  const GeneralTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Site Information
          </CardTitle>
          <CardDescription>
            Configure your site's basic information and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName" className={validationErrors.siteName ? "text-destructive" : ""}>
              Site Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => updateSetting("siteName", e.target.value)}
              data-testid="site-name"
              className={validationErrors.siteName ? "border-destructive focus:border-destructive" : ""}
              placeholder="Enter your site name"
            />
            {validationErrors.siteName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.siteName}
              </p>
            )}
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
            <Label htmlFor="siteUrl" className={validationErrors.siteUrl ? "text-destructive" : ""}>
              Site URL
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="siteUrl"
              type="url"
              value={settings.siteUrl}
              onChange={(e) => updateSetting("siteUrl", e.target.value)}
              data-testid="site-url"
              className={validationErrors.siteUrl ? "border-destructive focus:border-destructive" : ""}
              placeholder="https://yoursite.com"
            />
            {validationErrors.siteUrl && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.siteUrl}
              </p>
            )}
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
              <Label htmlFor="passwordMinLength" className={validationErrors.passwordMinLength ? "text-destructive" : ""}>
                Minimum Password Length
              </Label>
              <Input
                id="passwordMinLength"
                type="number"
                min="8"
                max="64"
                value={settings.passwordMinLength}
                onChange={(e) => updateSetting("passwordMinLength", e.target.value)}
                data-testid="password-min-length"
                className={validationErrors.passwordMinLength ? "border-destructive focus:border-destructive" : ""}
              />
              {validationErrors.passwordMinLength && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.passwordMinLength}
                </p>
              )}
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
              <Label htmlFor="fromEmail" className={validationErrors.fromEmail ? "text-destructive" : ""}>
                From Email
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="fromEmail"
                type="email"
                value={settings.fromEmail}
                onChange={(e) => updateSetting("fromEmail", e.target.value)}
                data-testid="from-email"
                className={validationErrors.fromEmail ? "border-destructive focus:border-destructive" : ""}
                placeholder="noreply@yoursite.com"
              />
              {validationErrors.fromEmail && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.fromEmail}
                </p>
              )}
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
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Settings saved successfully
                </div>
              )}
              {isDirty && (
                <Button 
                  onClick={handleSave} 
                  data-testid="save-settings-desktop"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
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
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <ProfileTab />
            </TabsContent>
            
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
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Profile
              </TabsTrigger>
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
            
            <TabsContent value="profile">
              <ProfileTab />
            </TabsContent>
            
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

      {/* Mobile Action Bar - Enhanced */}
      <ActionBar show={isDirty || saveSuccess}>
        {saveSuccess ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Settings saved successfully</span>
          </div>
        ) : (
          <>
            <span className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Unsaved changes
            </span>
            <Button 
              onClick={handleSave} 
              size="sm" 
              data-testid="save-settings-mobile"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        )}
      </ActionBar>
    </Page>
  );
}