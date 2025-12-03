import React from 'react';
import { Planet } from '@/lib/kundliCalculations';

interface PlanetInfoTableProps {
  planets: Planet[];
}

const PlanetInfoTable: React.FC<PlanetInfoTableProps> = ({ planets }) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-2 py-1 text-left text-foreground">Planet</th>
            <th className="px-2 py-1 text-right text-foreground">Degree</th>
            <th className="px-2 py-1 text-left text-foreground">Sign</th>
            <th className="px-2 py-1 text-right text-foreground">Longitude</th>
            <th className="px-2 py-1 text-left text-foreground">Nakshatra</th>
            <th className="px-2 py-1 text-center text-foreground">Pada</th>
            <th className="px-2 py-1 text-center text-foreground">Lord</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((planet, index) => (
            <tr key={index} className="border-t border-border hover:bg-muted/50">
              <td className="px-2 py-1 font-medium text-foreground">{planet.name}</td>
              <td className="px-2 py-1 text-right text-muted-foreground">{Math.floor(planet.degree)}°</td>
              <td className="px-2 py-1 text-foreground">{planet.zodiac}</td>
              <td className="px-2 py-1 text-right text-muted-foreground">{planet.ra.toFixed(3)}°</td>
              <td className="px-2 py-1 text-foreground">{planet.nakshatra}</td>
              <td className="px-2 py-1 text-center text-muted-foreground">{planet.nakshatraPada}</td>
              <td className="px-2 py-1 text-center text-foreground">{planet.nakshatraLord}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanetInfoTable;
