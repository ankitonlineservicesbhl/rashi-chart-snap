import React, { useRef, useEffect } from 'react';

interface RashiChartProps {
  rashis: number[];
  houses: string[][];
  title?: string;
}

const RashiChart: React.FC<RashiChartProps> = ({ rashis, houses, title = "Rashi Chart" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = 0;
    const y = 0;
    const width = 250;
    const height = 200;

    // Draw chart structure (North Indian style)
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#FFFFFF';

    // Fill background
    ctx.fillRect(x, y, width, height);

    // Outer square
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.stroke();

    // Inner diamond
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x + width / 2, y + height);
    ctx.closePath();
    ctx.stroke();

    // Diagonal lines
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y + height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width, y);
    ctx.stroke();

    // Draw zodiac numbers (small, in corners of houses)
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';

    // Position for zodiac numbers (12 houses, clockwise from top center)
    const zodiacPos = [
      [125, 93],   // House 1 (center top)
      [62, 43],    // House 2 (top left inner)
      [50, 54],    // House 3 (left top)
      [111, 104],  // House 4 (center)
      [50, 154],   // House 5 (left bottom)
      [62, 165],   // House 6 (bottom left inner)
      [125, 117],  // House 7 (center bottom)
      [188, 165],  // House 8 (bottom right inner)
      [200, 154],  // House 9 (right bottom)
      [139, 104],  // House 10 (center right)
      [200, 54],   // House 11 (right top)
      [188, 43]    // House 12 (top right inner)
    ];

    // Draw zodiac signs
    rashis.forEach((rashi, i) => {
      ctx.fillText(String(rashi), zodiacPos[i][0], zodiacPos[i][1]);
    });

    // Draw planets in houses
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';

    const housePos = [
      [125, 53],   // House 1
      [62, 13],    // House 2
      [26, 54],    // House 3
      [62, 104],   // House 4
      [26, 154],   // House 5
      [62, 195],   // House 6
      [125, 154],  // House 7
      [188, 195],  // House 8
      [224, 154],  // House 9
      [189, 104],  // House 10
      [224, 54],   // House 11
      [188, 13]    // House 12
    ];

    houses.forEach((planets, i) => {
      if (planets.length > 0) {
        ctx.fillText(planets.join(' '), housePos[i][0], housePos[i][1]);
      }
    });

    // Draw title
    ctx.font = '11px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.fillText(title, 2, height + 15);

  }, [rashis, houses, title]);

  return (
    <canvas 
      ref={canvasRef} 
      width={250} 
      height={220}
      className="border border-border"
    />
  );
};

export default RashiChart;
