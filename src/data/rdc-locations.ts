// Données géographiques complètes de la République Démocratique du Congo

export interface Province {
  id: string;
  name: string;
  capital: string;
  territories: Territory[];
}

export interface Territory {
  id: string;
  name: string;
  cities: City[];
}

export interface City {
  id: string;
  name: string;
  type: 'ville' | 'commune' | 'secteur' | 'chefferie';
}

export const rdcProvinces: Province[] = [
  {
    id: 'kinshasa',
    name: 'Kinshasa',
    capital: 'Kinshasa',
    territories: [
      {
        id: 'kinshasa-ville',
        name: 'Kinshasa',
        cities: [
          { id: 'bandalungwa', name: 'Bandalungwa', type: 'commune' },
          { id: 'barumbu', name: 'Barumbu', type: 'commune' },
          { id: 'gombe', name: 'Gombe', type: 'commune' },
          { id: 'kalamu', name: 'Kalamu', type: 'commune' },
          { id: 'kasa-vubu', name: 'Kasa-Vubu', type: 'commune' },
          { id: 'kimbanseke', name: 'Kimbanseke', type: 'commune' },
          { id: 'kinshasa', name: 'Kinshasa', type: 'commune' },
          { id: 'kintambo', name: 'Kintambo', type: 'commune' },
          { id: 'lemba', name: 'Lemba', type: 'commune' },
          { id: 'limete', name: 'Limete', type: 'commune' },
          { id: 'lingwala', name: 'Lingwala', type: 'commune' },
          { id: 'makala', name: 'Makala', type: 'commune' },
          { id: 'maluku', name: 'Maluku', type: 'commune' },
          { id: 'masina', name: 'Masina', type: 'commune' },
          { id: 'matete', name: 'Matete', type: 'commune' },
          { id: 'mont-ngafula', name: 'Mont-Ngafula', type: 'commune' },
          { id: 'ndjili', name: 'N\'djili', type: 'commune' },
          { id: 'ngaba', name: 'Ngaba', type: 'commune' },
          { id: 'ngaliema', name: 'Ngaliema', type: 'commune' },
          { id: 'ngiri-ngiri', name: 'Ngiri-Ngiri', type: 'commune' },
          { id: 'nsele', name: 'Nsele', type: 'commune' },
          { id: 'bumbu', name: 'Bumbu', type: 'commune' },
          { id: 'kisenso', name: 'Kisenso', type: 'commune' },
          { id: 'selembao', name: 'Selembao', type: 'commune' },
        ]
      }
    ]
  },
  {
    id: 'kongo-central',
    name: 'Kongo Central',
    capital: 'Matadi',
    territories: [
      {
        id: 'matadi',
        name: 'Matadi',
        cities: [
          { id: 'matadi-ville', name: 'Matadi', type: 'ville' },
          { id: 'nzanza', name: 'Nzanza', type: 'secteur' },
        ]
      },
      {
        id: 'boma',
        name: 'Boma',
        cities: [
          { id: 'boma-ville', name: 'Boma', type: 'ville' },
          { id: 'kalamu-boma', name: 'Kalamu', type: 'secteur' },
        ]
      },
      {
        id: 'muanda',
        name: 'Muanda',
        cities: [
          { id: 'muanda-ville', name: 'Muanda', type: 'ville' },
        ]
      }
    ]
  },
  {
    id: 'bandundu',
    name: 'Kwilu',
    capital: 'Bandundu',
    territories: [
      {
        id: 'bandundu',
        name: 'Bandundu',
        cities: [
          { id: 'bandundu-ville', name: 'Bandundu', type: 'ville' },
        ]
      },
      {
        id: 'kikwit',
        name: 'Kikwit',
        cities: [
          { id: 'kikwit-ville', name: 'Kikwit', type: 'ville' },
        ]
      }
    ]
  },
  {
    id: 'equateur',
    name: 'Équateur',
    capital: 'Mbandaka',
    territories: [
      {
        id: 'mbandaka',
        name: 'Mbandaka',
        cities: [
          { id: 'mbandaka-ville', name: 'Mbandaka', type: 'ville' },
        ]
      }
    ]
  },
  {
    id: 'orientale',
    name: 'Tshopo',
    capital: 'Kisangani',
    territories: [
      {
        id: 'kisangani',
        name: 'Kisangani',
        cities: [
          { id: 'kisangani-ville', name: 'Kisangani', type: 'ville' },
          { id: 'makiso', name: 'Makiso', type: 'commune' },
          { id: 'kisangani-commune', name: 'Kisangani', type: 'commune' },
          { id: 'kabondo', name: 'Kabondo', type: 'commune' },
          { id: 'lubunga', name: 'Lubunga', type: 'commune' },
          { id: 'mangobo', name: 'Mangobo', type: 'commune' },
          { id: 'tshopo', name: 'Tshopo', type: 'commune' },
        ]
      }
    ]
  },
  {
    id: 'kasai',
    name: 'Kasaï',
    capital: 'Kananga',
    territories: [
      {
        id: 'kananga',
        name: 'Kananga',
        cities: [
          { id: 'kananga-ville', name: 'Kananga', type: 'ville' },
        ]
      }
    ]
  },
  {
    id: 'kasai-oriental',
    name: 'Kasaï-Oriental',
    capital: 'Mbuji-Mayi',
    territories: [
      {
        id: 'mbuji-mayi',
        name: 'Mbuji-Mayi',
        cities: [
          { id: 'mbuji-mayi-ville', name: 'Mbuji-Mayi', type: 'ville' },
        ]
      }
    ]
  },
  {
    id: 'katanga',
    name: 'Haut-Katanga',
    capital: 'Lubumbashi',
    territories: [
      {
        id: 'lubumbashi',
        name: 'Lubumbashi',
        cities: [
          { id: 'lubumbashi-ville', name: 'Lubumbashi', type: 'ville' },
          { id: 'annexe', name: 'Annexe', type: 'commune' },
          { id: 'kampemba', name: 'Kampemba', type: 'commune' },
          { id: 'kamalondo', name: 'Kamalondo', type: 'commune' },
          { id: 'kenya', name: 'Kenya', type: 'commune' },
          { id: 'katuba', name: 'Katuba', type: 'commune' },
          { id: 'rwashi', name: 'Rwashi', type: 'commune' },
        ]
      }
    ]
  },
  {
    id: 'maniema',
    name: 'Maniema',
    capital: 'Kindu',
    territories: [
      {
        id: 'kindu',
        name: 'Kindu',
        cities: [
          { id: 'kindu-ville', name: 'Kindu', type: 'ville' },
        ]
      }
    ]
  },
  {
    id: 'nord-kivu',
    name: 'Nord-Kivu',
    capital: 'Goma',
    territories: [
      {
        id: 'goma',
        name: 'Goma',
        cities: [
          { id: 'goma-ville', name: 'Goma', type: 'ville' },
          { id: 'karisimbi', name: 'Karisimbi', type: 'commune' },
          { id: 'goma-commune', name: 'Goma', type: 'commune' },
        ]
      },
      {
        id: 'butembo',
        name: 'Butembo',
        cities: [
          { id: 'butembo-ville', name: 'Butembo', type: 'ville' },
        ]
      }
    ]
  },
  {
    id: 'sud-kivu',
    name: 'Sud-Kivu',
    capital: 'Bukavu',
    territories: [
      {
        id: 'bukavu',
        name: 'Bukavu',
        cities: [
          { id: 'bukavu-ville', name: 'Bukavu', type: 'ville' },
          { id: 'ibanda', name: 'Ibanda', type: 'commune' },
          { id: 'kadutu', name: 'Kadutu', type: 'commune' },
          { id: 'bagira', name: 'Bagira', type: 'commune' },
        ]
      }
    ]
  }
];

// Fonction utilitaire pour rechercher des lieux
export function searchLocations(query: string): Array<{
  id: string;
  name: string;
  type: 'province' | 'territoire' | 'ville';
  province?: string;
  territory?: string;
}> {
  const results: Array<{
    id: string;
    name: string;
    type: 'province' | 'territoire' | 'ville';
    province?: string;
    territory?: string;
  }> = [];

  const searchTerm = query.toLowerCase();

  rdcProvinces.forEach(province => {
    // Recherche dans les provinces
    if (province.name.toLowerCase().includes(searchTerm)) {
      results.push({
        id: province.id,
        name: province.name,
        type: 'province'
      });
    }

    province.territories.forEach(territory => {
      // Recherche dans les territoires
      if (territory.name.toLowerCase().includes(searchTerm)) {
        results.push({
          id: territory.id,
          name: territory.name,
          type: 'territoire',
          province: province.name
        });
      }

      territory.cities.forEach(city => {
        // Recherche dans les villes
        if (city.name.toLowerCase().includes(searchTerm)) {
          results.push({
            id: city.id,
            name: city.name,
            type: 'ville',
            province: province.name,
            territory: territory.name
          });
        }
      });
    });
  });

  return results.slice(0, 10); // Limiter à 10 résultats
}