import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface PDFExportOptions {
  title: string
  filename?: string
  data: any[] | Record<string, any>
  columns?: string[] // For table data - specify which fields to include
  headers?: Record<string, string> // Custom headers for columns
  type?: "table" | "details" // table for array data, details for single object
}

export const exportToPDF = (options: PDFExportOptions) => {
  const {
    title,
    filename = title.toLowerCase().replace(/\s+/g, "-"),
    data,
    columns,
    headers = {},
    type = Array.isArray(data) ? "table" : "details",
  } = options

  const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.setTextColor(40, 40, 40)
  doc.text(title, 20, 30)

  // Add date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40)

  if (type === "table" && Array.isArray(data)) {
    // Handle table data (array of objects)
    if (data.length === 0) return

    // Get columns from first object if not specified
    const tableColumns = columns || Object.keys(data[0])

    // Create headers
    const tableHeaders = tableColumns.map((col) => headers[col] || col.charAt(0).toUpperCase() + col.slice(1))

    // Create table data
    const tableData = data.map((item) =>
      tableColumns.map((col) => {
        const value = item[col]
        if (Array.isArray(value)) return value.join(", ")
        return value?.toString() || "N/A"
      }),
    )

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 55,
      theme: "grid",
      headStyles: {
        fillColor: [249, 219, 111],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        textColor: [60, 60, 60],
        fontSize: 8,
      },
      styles: {
        overflow: "linebreak",
        cellPadding: 3,
      },
    })
  } else {
    // Handle single object details
    const itemData = Array.isArray(data) ? data[0] : data

    const detailsData = Object.entries(itemData).map(([key, value]) => {
      const label = headers[key] || key.charAt(0).toUpperCase() + key.slice(1)
      let displayValue = "N/A"

      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          displayValue = value.join(", ")
        } else {
          displayValue = value.toString()
        }
      }

      return [label, displayValue]
    })

    autoTable(doc, {
      head: [["Field", "Value"]],
      body: detailsData,
      startY: 55,
      theme: "grid",
      headStyles: {
        fillColor: [249, 219, 111],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 120 },
      },
    })
  }

  // Save the PDF
  doc.save(`${filename}-${new Date().toISOString().split("T")[0]}.pdf`)
}
