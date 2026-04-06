import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

const PROPERTY_SCHEMA = {
  type: "object",
  required: ["name", "address", "type", "buildings"],
  properties: {
    name:    { type: "string",  description: "Full name of the property or complex" },
    address: { type: "string",  description: "Full street address of the property" },
    number:  { type: "string",  description: "Internal property reference number" },
    type:    { type: "string",  enum: ["WEG", "MV"] },
    buildings: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["label"],
        properties: {
          label:       { type: "string" },
          street:      { type: "string" },
          houseNumber: { type: "string" },
          postalCode:  { type: "string" },
          city:        { type: "string" },
          yearBuilt:   { type: "integer" },
          floors:      { type: "integer" },
          units: {
            type: "array",
            items: {
              type: "object",
              required: ["number", "type"],
              properties: {
                number:           { type: "string" },
                type:             { type: "string", enum: ["APARTMENT", "OFFICE", "GARDEN", "PARKING"] },
                floor:            { type: "string", description: "Floor level: UG (basement), EG (ground floor), or floor number as integer string e.g. '1', '2', '3'" },
                entrance:         { type: "string" },
                sizeSqm:          { type: "number" },
                coOwnershipShare: { type: "string", description: "Miteigentumsanteil, e.g. 153/10000" },
                yearBuilt:        { type: "integer" },
                rooms:            { type: "number" },
              },
            },
          },
        },
      },
    },
  },
};

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { documentUrl } = body as { documentUrl?: string };
  if (!documentUrl) {
    return Response.json({ error: "documentUrl is required" }, { status: 400 });
  }

  try {
    const ocr = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: { type: "document_url", documentUrl },
      documentAnnotationFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "property",
          schemaDefinition: PROPERTY_SCHEMA,
        },
      },
      documentAnnotationPrompt:
        "Extract all structured property data from this declaration of division (Teilungserklärung). " +
        "Use null for missing fields. " +
        "Preserve Miteigentumsanteil as fractions, e.g. '153/10000'. " +
        "Normalise floor (Geschoss) to: 'UG' (Untergeschoss), 'EG' (Erdgeschoss), or integer string ('1', '2', '3') for upper floors.",
    });

    if (!ocr.documentAnnotation) {
      return Response.json({ error: "No data extracted" }, { status: 422 });
    }

    const parsed = JSON.parse(ocr.documentAnnotation);
    return Response.json(parsed);
  } catch (err) {
    console.error("Mistral OCR error:", err);
    return Response.json({ error: "Extraction failed" }, { status: 502 });
  }
}
