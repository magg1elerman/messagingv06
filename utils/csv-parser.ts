export async function fetchCSVData(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV data: ${response.statusText}`)
  }
  return response.text()
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",").map((header) => header.trim().replace(/^"|"$/g, ""))

  return lines
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const values = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""))
      const record: Record<string, string> = {}

      headers.forEach((header, index) => {
        record[header] = values[index] || ""
      })

      return record
    })
}
