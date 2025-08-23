import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Policy() {
  return (
    <div className="max-w-3xl mx-auto p-6 pt-24">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>We collect minimal data necessary to provide and improve DNSCAP.</p>
          <p>Your information is never sold and is only used for analytics and service improvement.</p>
          <p>By using DNSCAP, you consent to this policy.</p>
        </CardContent>
      </Card>
    </div>
  );
}
