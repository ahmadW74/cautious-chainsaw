import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>About DNSCAP</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mission" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="mission">Mission</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="mission">
              <p>DNSCAP empowers users to visualize and understand domain security.</p>
            </TabsContent>
            <TabsContent value="team">
              <p>Our small team of engineers loves building transparent security tools.</p>
            </TabsContent>
            <TabsContent value="history">
              <p>Founded in 2025, DNSCAP began as a research project and grew into a community effort.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
