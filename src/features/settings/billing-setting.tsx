import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, CheckCircle2, Download, ExternalLink } from "lucide-react";

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing information.
              </CardDescription>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Premium Plan</h3>
                <p className="text-sm text-muted-foreground">Billed annually</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">$99.99/year</p>
                <p className="text-sm text-muted-foreground">
                  Next billing date: Jan 1, 2024
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Unlimited workout plans</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Advanced analytics and insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Personal coaching sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Ad-free experience</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                Change Plan
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                Cancel Subscription
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Payment Method</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/2025
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                Add Payment Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Premium Plan - Annual</p>
                <p className="text-sm text-muted-foreground">Jan 1, 2023</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium">$99.99</p>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Premium Plan - Annual</p>
                <p className="text-sm text-muted-foreground">Jan 1, 2022</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium">$89.99</p>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Premium Plan - Monthly</p>
                <p className="text-sm text-muted-foreground">Dec 1, 2021</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium">$9.99</p>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Invoices
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>
            Update your billing address for invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4">
            <p className="font-medium">John Doe</p>
            <p className="text-sm">123 Fitness Street</p>
            <p className="text-sm">Apt 456</p>
            <p className="text-sm">New York, NY 10001</p>
            <p className="text-sm">United States</p>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                Edit Address
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
