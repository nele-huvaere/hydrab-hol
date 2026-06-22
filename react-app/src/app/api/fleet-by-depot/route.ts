import { NextResponse } from 'next/server'

const depots = [
  { DEPOT: "Ballymount", CITY: "Dublin", VEHICLE_COUNT: 218, DEPLOYED: 195, IN_PRODUCTION: 23 },
  { DEPOT: "Olive Grove", CITY: "Bradford", VEHICLE_COUNT: 213, DEPLOYED: 198, IN_PRODUCTION: 15 },
  { DEPOT: "Queens Road", CITY: "Manchester", VEHICLE_COUNT: 189, DEPLOYED: 172, IN_PRODUCTION: 17 },
  { DEPOT: "Shepherd's Bush", CITY: "London", VEHICLE_COUNT: 176, DEPLOYED: 168, IN_PRODUCTION: 8 },
  { DEPOT: "Walworth", CITY: "London", VEHICLE_COUNT: 165, DEPLOYED: 155, IN_PRODUCTION: 10 },
  { DEPOT: "Yardley Wood", CITY: "Birmingham", VEHICLE_COUNT: 142, DEPLOYED: 130, IN_PRODUCTION: 12 },
  { DEPOT: "Lawrence Hill", CITY: "Bristol", VEHICLE_COUNT: 128, DEPLOYED: 120, IN_PRODUCTION: 8 },
  { DEPOT: "Annandale St", CITY: "Edinburgh", VEHICLE_COUNT: 115, DEPLOYED: 108, IN_PRODUCTION: 7 },
  { DEPOT: "Bramley", CITY: "Leeds", VEHICLE_COUNT: 112, DEPLOYED: 104, IN_PRODUCTION: 8 },
  { DEPOT: "Falls Road", CITY: "Belfast", VEHICLE_COUNT: 98, DEPLOYED: 91, IN_PRODUCTION: 7 },
  { DEPOT: "Cathcart", CITY: "Glasgow", VEHICLE_COUNT: 94, DEPLOYED: 88, IN_PRODUCTION: 6 },
  { DEPOT: "Green Lane", CITY: "Liverpool", VEHICLE_COUNT: 87, DEPLOYED: 82, IN_PRODUCTION: 5 },
  { DEPOT: "Byker", CITY: "Newcastle", VEHICLE_COUNT: 79, DEPLOYED: 73, IN_PRODUCTION: 6 },
  { DEPOT: "Cardiff Bay", CITY: "Cardiff", VEHICLE_COUNT: 72, DEPLOYED: 67, IN_PRODUCTION: 5 },
  { DEPOT: "Conway St", CITY: "Brighton", VEHICLE_COUNT: 65, DEPLOYED: 61, IN_PRODUCTION: 4 },
]

export async function GET() {
  return NextResponse.json(depots)
}
