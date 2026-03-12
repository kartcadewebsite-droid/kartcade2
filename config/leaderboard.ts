/**
 * Kartcade Leaderboard Configuration
 * 
 * This file contains normalized lists for Games, Tracks, and Cars.
 * Adam can update these lists here to ensure data consistency.
 */

export const NORMALIZED_GAMES = [
    // Racing
    'iRacing',
    'Assetto Corsa',
    'Automobilista 2',
    'F1 25',
    'Le Mans Ultimate',
    'Assetto Corsa Rally',
    'Dirt Rally 2.0',
    'WRC',
    'Richard Burns Rally',
    'Grid Legends',
    'CarX Drift Online',
    'Wreckfest (1 & 2)',
    'Deathsprint 66',
    'BeamNG',
    'American Truck Simulator',
    // Flight
    'Microsoft Flight Simulator',
    'Star Wars Squadrons',
    'Ace Combat 7',
    'Digital Combat Simulator',
    'Fly Dangerous',
    'Jetborne Racing',
    'War Thunder'
];

export const NORMALIZED_TRACKS: Record<string, string[]> = {
    'Assetto Corsa': [
        'Monza', 'Spa Francorchamps', 'Nürburgring Nordschleife', 'Imola', 'Mugello', 'Silverstone', 'Barcelona', 'Brands Hatch'
    ],
    'Assetto Corsa Competizione': [
        'Monza', 'Spa Francorchamps', 'Zolder', 'Misano', 'Mount Panorama', 'Kyalami', 'Suzuka'
    ],
    // Add more mappings as Adam provides them
};

export const NORMALIZED_CARS: Record<string, string[]> = {
    'GT3': [
        'Ferrari 488 GT3', 'Lamborghini Huracan GT3', 'Porsche 911 GT3 R', 'Audi R8 LMS GT3', 'BMW M4 GT3'
    ],
    // Add more mappings as Adam provides them
};
