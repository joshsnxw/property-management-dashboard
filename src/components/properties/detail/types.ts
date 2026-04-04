export interface Unit {
  id:               string;
  number:           string;
  type:             "APARTMENT" | "OFFICE" | "GARDEN" | "PARKING";
  floor:            string | null;
  entrance:         string | null;
  sizeSqm:          number | null;
  coOwnershipShare: string | null;
  yearBuilt:        number | null;
  rooms:            number | null;
  buildingId:       string;
}

export interface Building {
  id:          string;
  label:       string;
  street:      string;
  houseNumber: string;
  postalCode:  string;
  city:        string;
  yearBuilt:   number | null;
  floors:      number | null;
  propertyId:  string;
  units:       Unit[];
}

export interface Staff {
  id:   string;
  name: string;
  role: "MANAGER" | "ACCOUNTANT";
}

export interface Document {
  id:        string;
  name:      string;
  url:       string;
  sizeBytes: number | null;
  createdAt: string;
}

export interface PropertyDetail {
  id:          string;
  name:        string;
  number:      string;
  address:     string;
  type:        "WEG" | "MV";
  status:      "ACTIVE" | "PENDING" | "ARCHIVED";
  managerId:   string;
  accountantId:string;
  manager:     Staff | null;
  accountant:  Staff | null;
  buildings:   Building[];
  documents:   Document[];
  createdAt:   string;
  updatedAt:   string;
}
