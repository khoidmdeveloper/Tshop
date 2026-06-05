"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useState } from "react";
function SettingsPage() {
  const [formData, setFormData] = useState({
    storeName: "TechVortex",
    email: "contact@techvortex.com",
    phone: "+1 (555) 000-0000",
    address: "Tech City, TC 12345",
    currency: "USD",
    timezone: "UTC-5"
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = () => {
    alert("Settings saved successfully!");
  };
  return <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-primary font-mono text-sm font-bold tracking-widest mb-2">[ SETTINGS ]</p>
          <h1 className="text-4xl font-bold text-foreground mb-2">Store Settings</h1>
        </div>

        <div className="bg-secondary border border-border rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Store Name</label>
              <Input
    type="text"
    name="storeName"
    value={formData.storeName}
    onChange={handleChange}
    className="bg-background text-foreground border-border"
  />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Email</label>
              <Input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    className="bg-background text-foreground border-border"
  />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Phone</label>
              <Input
    type="tel"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    className="bg-background text-foreground border-border"
  />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Address</label>
              <Input
    type="text"
    name="address"
    value={formData.address}
    onChange={handleChange}
    className="bg-background text-foreground border-border"
  />
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Currency</label>
                <select
    name="currency"
    value={formData.currency}
    onChange={handleChange}
    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
  >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>VND</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Timezone</label>
                <select
    name="timezone"
    value={formData.timezone}
    onChange={handleChange}
    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
  >
                  <option>UTC-5</option>
                  <option>UTC-8</option>
                  <option>UTC+7</option>
                  <option>UTC+0</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Button
    onClick={handleSave}
    className="bg-primary text-primary-foreground hover:bg-primary/90 w-full gap-2"
  >
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export {
  SettingsPage as default
};
