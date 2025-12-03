import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface BirthInfoFormProps {
  name: string;
  setName: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
  tz: string;
  setTz: (value: string) => void;
  lat: string;
  setLat: (value: string) => void;
  lon: string;
  setLon: (value: string) => void;
  onGenerate: () => void;
}

const BirthInfoForm: React.FC<BirthInfoFormProps> = ({
  name, setName,
  date, setDate,
  time, setTime,
  tz, setTz,
  lat, setLat,
  lon, setLon,
  onGenerate
}) => {
  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <h2 className="text-lg font-semibold text-foreground">Enter Birth Info</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="col-span-2 md:col-span-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="tz" title="Time Zone to GMT (+/-)">TZ</Label>
          <Input
            id="tz"
            type="number"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            min="-12"
            max="14"
            step="1"
          />
        </div>

        <div>
          <Label htmlFor="lat" title="Format: 23N39 or 23S39">Latitude</Label>
          <Input
            id="lat"
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="23N39"
          />
        </div>

        <div>
          <Label htmlFor="lon" title="Format: 80E42 or 80W42">Longitude</Label>
          <Input
            id="lon"
            type="text"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="80E42"
          />
        </div>
      </div>

      <Button onClick={onGenerate} className="w-full">
        Draw Chart
      </Button>
    </div>
  );
};

export default BirthInfoForm;
