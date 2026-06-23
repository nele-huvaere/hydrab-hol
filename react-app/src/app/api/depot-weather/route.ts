import { NextResponse } from 'next/server'

const depotWeather = [
  { depot: 'Ballymount', city: 'Dublin', temp: 15.8, wind: 18.7, precipitation: 1.2, avgSoc: 68, condition: 'Light rain' },
  { depot: 'Olive Grove', city: 'Bradford', temp: 17.2, wind: 12.3, precipitation: 0.0, avgSoc: 72, condition: 'Overcast' },
  { depot: 'Queens Road', city: 'Manchester', temp: 16.4, wind: 22.1, precipitation: 2.8, avgSoc: 61, condition: 'Moderate rain' },
  { depot: "Shepherd's Bush", city: 'London', temp: 21.5, wind: 11.4, precipitation: 0.0, avgSoc: 74, condition: 'Partly cloudy' },
  { depot: 'Walworth', city: 'London', temp: 21.5, wind: 11.4, precipitation: 0.0, avgSoc: 71, condition: 'Partly cloudy' },
  { depot: 'Yardley Wood', city: 'Birmingham', temp: 18.1, wind: 14.6, precipitation: 0.5, avgSoc: 65, condition: 'Drizzle' },
  { depot: 'Lawrence Hill', city: 'Bristol', temp: 19.3, wind: 9.8, precipitation: 0.0, avgSoc: 77, condition: 'Sunny' },
  { depot: 'Annandale St', city: 'Edinburgh', temp: 13.2, wind: 24.5, precipitation: 0.8, avgSoc: 70, condition: 'Windy, showers' },
  { depot: 'Bramley', city: 'Leeds', temp: 16.8, wind: 15.2, precipitation: 0.3, avgSoc: 66, condition: 'Overcast' },
  { depot: 'Falls Road', city: 'Belfast', temp: 14.2, wind: 22.1, precipitation: 0.3, avgSoc: 73, condition: 'Light rain' },
  { depot: 'Cathcart', city: 'Glasgow', temp: 12.8, wind: 26.3, precipitation: 1.5, avgSoc: 69, condition: 'Heavy wind' },
  { depot: 'Green Lane', city: 'Liverpool', temp: 17.1, wind: 18.9, precipitation: 1.9, avgSoc: 63, condition: 'Rain' },
  { depot: 'Byker', city: 'Newcastle', temp: 14.6, wind: 19.4, precipitation: 0.1, avgSoc: 75, condition: 'Cloudy' },
  { depot: 'Cardiff Bay', city: 'Cardiff', temp: 18.7, wind: 13.1, precipitation: 0.0, avgSoc: 71, condition: 'Clear' },
  { depot: 'Conway St', city: 'Brighton', temp: 20.2, wind: 10.6, precipitation: 0.0, avgSoc: 78, condition: 'Sunny' },
]

export async function GET() {
  return NextResponse.json(depotWeather)
}
