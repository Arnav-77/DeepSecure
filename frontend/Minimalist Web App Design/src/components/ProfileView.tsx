import { User, Info, CreditCard, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { useState, useEffect } from "react";

interface ProfileViewProps {
  defaultTab?: "profile" | "account" | "billing";
}

export function ProfileView({ defaultTab = "profile" }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "profile" | "account" | "billing")} className="flex-1 flex flex-col">
        <TabsList className="inline-flex w-fit bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-gray-50 dark:data-[state=active]:bg-gray-800"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="account"
            className="data-[state=active]:bg-gray-50 dark:data-[state=active]:bg-gray-800"
          >
            <Info className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className="data-[state=active]:bg-gray-50 dark:data-[state=active]:bg-gray-800"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="flex-1 mt-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Your profile information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Name</Label>
                <div className="text-gray-900 dark:text-gray-100">
                  No name provided
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-800" />

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Email</Label>
                <div className="text-gray-900 dark:text-gray-100">
                  sabharwalsaransh@gmail.com
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="flex-1 mt-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Account Settings
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your account preferences and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
                <Input 
                  id="username" 
                  placeholder="Enter username" 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 mt-6">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
              <CardDescription className="text-red-600 dark:text-red-500">
                Deleting your account is permanent and cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700">
                <AlertCircle className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="flex-1 mt-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Plans
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your subscription and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900 dark:text-gray-100">Current Plan</h3>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                    Pro
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  5 Authentications remaining using Pro Models
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Payment Method</Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100">•••• •••• •••• 4242</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" className="border-gray-200 dark:border-gray-700">
                  Update Payment
                </Button>
                <Button variant="outline" className="border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
