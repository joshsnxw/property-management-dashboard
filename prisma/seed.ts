import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Contacts
  const alice = await prisma.contact.upsert({
    where: { id: "staff-alice" },
    update: {},
    create: { id: "staff-alice", name: "Alice Müller", role: "MANAGER" },
  });
  const bob = await prisma.contact.upsert({
    where: { id: "staff-bob" },
    update: {},
    create: { id: "staff-bob", name: "Bob Schmidt", role: "MANAGER" },
  });
  const clara = await prisma.contact.upsert({
    where: { id: "staff-clara" },
    update: {},
    create: { id: "staff-clara", name: "Clara Weber", role: "ACCOUNTANT" },
  });
  const dieter = await prisma.contact.upsert({
    where: { id: "staff-dieter" },
    update: {},
    create: { id: "staff-dieter", name: "Dieter Bauer", role: "ACCOUNTANT" },
  });

  // Property 1 — WEG, active
  await prisma.property.upsert({
    where: { number: "WEG-001" },
    update: {},
    create: {
      id: "prop-1",
      name: "Wohnanlage Prenzlauer Berg",
      address: "Kastanienallee 12, 10435 Berlin",
      number: "WEG-001",
      type: "WEG",
      status: "ACTIVE",
      managerId: alice.id,
      accountantId: clara.id,
      buildings: {
        create: [
          {
            id: "bld-1a",
            label: "Haus A",
            street: "Kastanienallee",
            houseNumber: "12",
            postalCode: "10435",
            city: "Berlin",
            yearBuilt: 1928,
            floors: 5,
            units: {
              create: [
                { number: "1L", type: "APARTMENT", floor: "1", sizeSqm: 68, rooms: 2.5 },
                { number: "1R", type: "APARTMENT", floor: "1", sizeSqm: 72, rooms: 3 },
                { number: "2L", type: "APARTMENT", floor: "2", sizeSqm: 68, rooms: 2.5 },
                { number: "2R", type: "APARTMENT", floor: "2", sizeSqm: 72, rooms: 3 },
                { number: "K1", type: "PARKING",   floor: "UG" },
              ],
            },
          },
          {
            id: "bld-1b",
            label: "Haus B",
            street: "Kastanienallee",
            houseNumber: "12a",
            postalCode: "10435",
            city: "Berlin",
            yearBuilt: 1930,
            floors: 4,
            units: {
              create: [
                { number: "1L", type: "APARTMENT", floor: "1", sizeSqm: 55, rooms: 2 },
                { number: "1R", type: "APARTMENT", floor: "1", sizeSqm: 60, rooms: 2 },
                { number: "G1", type: "GARDEN",    floor: "EG" },
              ],
            },
          },
        ],
      },
    },
  });

  // Property 2 — MV, active
  await prisma.property.upsert({
    where: { number: "MV-001" },
    update: {},
    create: {
      id: "prop-2",
      name: "Gewerbehaus Mitte",
      address: "Torstraße 88, 10119 Berlin",
      number: "MV-001",
      type: "MV",
      status: "ACTIVE",
      managerId: bob.id,
      accountantId: clara.id,
      buildings: {
        create: [
          {
            id: "bld-2a",
            label: "Hauptgebäude",
            street: "Torstraße",
            houseNumber: "88",
            postalCode: "10119",
            city: "Berlin",
            yearBuilt: 2005,
            floors: 6,
            units: {
              create: [
                { number: "EG-01", type: "OFFICE", floor: "EG", sizeSqm: 120, rooms: 4 },
                { number: "EG-02", type: "OFFICE", floor: "EG", sizeSqm: 85,  rooms: 3 },
                { number: "1-01",  type: "OFFICE", floor: "1",  sizeSqm: 200, rooms: 6 },
                { number: "P1",    type: "PARKING", floor: "UG" },
                { number: "P2",    type: "PARKING", floor: "UG" },
              ],
            },
          },
        ],
      },
    },
  });

  // Property 3 — WEG, pending
  await prisma.property.upsert({
    where: { number: "WEG-002" },
    update: {},
    create: {
      id: "prop-3",
      name: "Residenz Charlottenburg",
      address: "Kantstraße 45, 10625 Berlin",
      number: "WEG-002",
      type: "WEG",
      status: "PENDING",
      managerId: alice.id,
      accountantId: dieter.id,
      buildings: {
        create: [
          {
            id: "bld-3a",
            label: "Haus A",
            street: "Kantstraße",
            houseNumber: "45",
            postalCode: "10625",
            city: "Berlin",
            yearBuilt: 1965,
            floors: 8,
            units: {
              create: [
                { number: "101", type: "APARTMENT", floor: "1", sizeSqm: 90,  rooms: 3.5 },
                { number: "102", type: "APARTMENT", floor: "1", sizeSqm: 78,  rooms: 3 },
                { number: "201", type: "APARTMENT", floor: "2", sizeSqm: 90,  rooms: 3.5 },
                { number: "TG1", type: "PARKING",   floor: "UG" },
              ],
            },
          },
        ],
      },
    },
  });

  // Property 4 — MV, archived
  await prisma.property.upsert({
    where: { number: "MV-002" },
    update: {},
    create: {
      id: "prop-4",
      name: "Lager Spandau",
      address: "Brunsbütteler Damm 5, 13581 Berlin",
      number: "MV-002",
      type: "MV",
      status: "ARCHIVED",
      managerId: bob.id,
      accountantId: dieter.id,
      buildings: {
        create: [
          {
            id: "bld-4a",
            label: "Lagerhalle",
            street: "Brunsbütteler Damm",
            houseNumber: "5",
            postalCode: "13581",
            city: "Berlin",
            yearBuilt: 1992,
            floors: 1,
            units: {
              create: [
                { number: "L1", type: "OFFICE", floor: "EG", sizeSqm: 300 },
                { number: "L2", type: "OFFICE", floor: "EG", sizeSqm: 300 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seed complete: 4 properties, 2 manager contacts, 2 accountant contacts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
