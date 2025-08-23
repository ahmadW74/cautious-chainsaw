import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Support() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">How do I analyze a domain?</p>
                <p className="text-sm text-muted-foreground">Enter a domain on the home page and press Analyze.</p>
              </div>
              <div>
                <p className="font-medium">Is DNSCAP free?</p>
                <p className="text-sm text-muted-foreground">Yes, DNSCAP is an open source project.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Your email" />
              <Input placeholder="Subject" />
              <Input placeholder="Message" className="h-24" />
            </CardContent>
            <CardFooter>
              <Button>Send</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
