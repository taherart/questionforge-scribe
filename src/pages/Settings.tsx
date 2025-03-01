
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Activity, Key, Lock, User, Bookmark } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save the API key to your backend
    toast.success("API key saved successfully!");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex flex-col gap-2">
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-bold tracking-tight"
        >
          Settings
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground"
        >
          Configure your MSQ Creator application settings.
        </motion.p>
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="output">Output Settings</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5 text-primary" />
                  OpenAI API Configuration
                </CardTitle>
                <CardDescription>
                  Configure your OpenAI API settings for question generation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveApiKey} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input 
                      id="apiKey" 
                      type="password" 
                      placeholder="Enter your OpenAI API key" 
                      defaultValue="sk-proj-V0BDww4XrzpcBknGuJKlv1QmNbgPj●●●●●●●●●●●●●●●"
                    />
                    <p className="text-sm text-muted-foreground">
                      Your API key is stored securely and used only for question generation.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <select 
                      id="model" 
                      className="w-full border border-input bg-background h-10 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      defaultValue="gpt-4o-mini"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="gpt-4o">GPT-4o</option>
                    </select>
                    <p className="text-sm text-muted-foreground">
                      Select the OpenAI model to use for question generation.
                    </p>
                  </div>
                  
                  <Button type="submit">Save API Settings</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="output" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bookmark className="mr-2 h-5 w-5 text-primary" />
                  Output Settings
                </CardTitle>
                <CardDescription>
                  Configure how question outputs are formatted and saved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="outputPath">Output Directory</Label>
                  <Input 
                    id="outputPath" 
                    placeholder="Path to output directory" 
                    defaultValue="/output"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Directory where CSV outputs will be saved.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="csvNaming">CSV File Naming Format</Label>
                  <Input 
                    id="csvNaming" 
                    placeholder="CSV naming format" 
                    defaultValue="G[grade]_[subject]_[semester].csv"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Format for naming output CSV files.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="progressLog">Progress Log</Label>
                  <Input 
                    id="progressLog" 
                    placeholder="Path to progress log" 
                    defaultValue="progress.txt"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    File that tracks processing progress to prevent duplication.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled>Save Output Settings</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="about" className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-primary" />
                  About MSQ Creator
                </CardTitle>
                <CardDescription>
                  Information about the application and current version.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Version</p>
                  <p className="text-sm">1.0.0</p>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm">
                    MSQ Creator is an application that uses OpenAI's API to automatically generate 
                    multiple-choice questions from educational books. It analyzes the content, 
                    extracts key concepts, and creates standalone questions with four options each.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Features</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>Automatic book metadata extraction</li>
                    <li>Intelligent question generation</li>
                    <li>Progress tracking and resumable processing</li>
                    <li>CSV export in standardized format</li>
                    <li>Difficulty level assignment based on grade</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Settings;
