import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Profile({ username, email, profilePic, onLogout }) {
  return (
    <div className="max-w-3xl mx-auto p-6 pt-24 space-y-6">
      <Card className="flex flex-col items-center p-6 space-y-4">
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="text-center">
          <h2 className="text-xl font-bold">{username || "User"}</h2>
          <p className="text-muted-foreground">{email || "No email"}</p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/history">View History</Link>
          </Button>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select className="w-full p-2 border rounded-md">
                <option>English</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <select className="w-full p-2 border rounded-md">
                <option>US</option>
                <option>EU</option>
              </select>
            </div>
          </div>
          <Button onClick={onLogout} variant="destructive" className="w-full">
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

