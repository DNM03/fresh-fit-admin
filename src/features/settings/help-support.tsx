import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquare,
  Mail,
  Phone,
  FileText,
  HelpCircle,
  Video,
} from "lucide-react";

export function HelpSupport() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Help Center</CardTitle>
          <CardDescription>
            Find answers to common questions or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <HelpCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search for help..." className="pl-10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 space-y-2"
            >
              <FileText className="h-6 w-6" />
              <span>Guides & Tutorials</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 space-y-2"
            >
              <Video className="h-6 w-6" />
              <span>Video Tutorials</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 space-y-2"
            >
              <MessageSquare className="h-6 w-6" />
              <span>Community Forum</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I track my workouts?</AccordionTrigger>
              <AccordionContent>
                You can track your workouts by going to the Workouts tab and
                selecting "Start Workout". Choose from our pre-made workouts or
                create your own. The app will guide you through each exercise
                and track your progress automatically.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                How do I connect my fitness device?
              </AccordionTrigger>
              <AccordionContent>
                Go to Settings &gt; Devices and select "Connect New Device".
                Follow the on-screen instructions to pair your device. We
                support most major fitness trackers and smartwatches including
                Apple Watch, Fitbit, and Garmin devices.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Can I share my progress with friends?
              </AccordionTrigger>
              <AccordionContent>
                Yes! You can share your workout results, achievements, and
                progress directly from the app. Go to your profile, select the
                achievement or workout you want to share, and tap the share icon
                to send it via social media or messaging apps.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                How do I cancel my subscription?
              </AccordionTrigger>
              <AccordionContent>
                You can cancel your subscription by going to Settings &gt;
                Billing &gt; Subscription and selecting "Cancel Subscription".
                Your premium features will remain active until the end of your
                current billing period.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                How accurate are the calorie calculations?
              </AccordionTrigger>
              <AccordionContent>
                Our calorie calculations are based on industry-standard formulas
                that take into account your weight, height, age, gender, and
                activity level. While they provide a good estimate, individual
                metabolism can vary. For the most accurate results, we recommend
                using a heart rate monitor during workouts.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All FAQs
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Get help from our support team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 space-y-2"
            >
              <MessageSquare className="h-6 w-6" />
              <span>Live Chat</span>
              <span className="text-xs text-muted-foreground">
                Available 24/7
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 space-y-2"
            >
              <Mail className="h-6 w-6" />
              <span>Email Support</span>
              <span className="text-xs text-muted-foreground">
                Response within 24 hours
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-center justify-center p-4 space-y-2"
            >
              <Phone className="h-6 w-6" />
              <span>Phone Support</span>
              <span className="text-xs text-muted-foreground">
                Mon-Fri, 9am-5pm
              </span>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Submit a Support Ticket</h3>
              <p className="text-sm text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="Your email" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input id="subject" placeholder="What's this about?" />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex justify-end">
                <Button>Submit Ticket</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
