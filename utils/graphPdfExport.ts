import jsPDF from "jspdf"

export interface PDFExportConfig {
  title: string
  fileName: string
  metadata: {
    // generatedOn: string
    department?: string
    dateRange?: string
    role?: string
  }
  sections: PDFSection[]
}

export interface PDFSection {
  type: "overview" | "breakdown" | "insights"
  title: string
  content: PDFContent[]
}

export interface PDFContent {
  type: "text" | "highlight" | "data-row" | "summary-stat"
  text: string
  color?: string
  size?: "small" | "normal" | "large"
  weight?: "normal" | "bold"
  indent?: boolean
}

export const exportToPDF = async (config: PDFExportConfig): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let yPos = margin

    // Set background
    pdf.setFillColor(25, 25, 25) // #191919
    pdf.rect(0, 0, pageWidth, pageHeight, "F")

    // Simple header
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont("helvetica", "bold")
    pdf.text(config.title, margin, 17)

    yPos = 25

    // Metadata section - simple and clean
    pdf.setTextColor(220, 220, 220)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    Object.entries(config.metadata).forEach(([key, value]) => {
      if (value) {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")
        pdf.text(`${label}: ${value}`, margin, yPos)
        yPos += 6
      }
    })

    yPos += 8

    // Process sections
    for (const section of config.sections) {
      // Check if we need a new page
      if (yPos > pageHeight - 40) {
        pdf.addPage()
        yPos = margin
      }

      // Section title
      pdf.setFillColor(249, 219, 111) // Gold accent
      pdf.rect(margin, yPos - 5, contentWidth, 12, "F")

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(section.title, margin + 5, yPos + 3)

      yPos += 12

      // Section content
      for (const item of section.content) {
        // Check page break
        if (yPos > pageHeight - 20) {
          pdf.addPage()
          yPos = margin
        }

        if (item.type === "summary-stat") {
          pdf.setTextColor(249, 219, 111) // Gold for stats
          pdf.setFontSize(12)
          pdf.setFont("helvetica", "bold")
        } else if (item.type === "highlight") {
          if (item.color === "success") {
            pdf.setTextColor(39, 174, 96) // Green
          } else if (item.color === "danger") {
            pdf.setTextColor(231, 76, 60) // Red
          } else {
            pdf.setTextColor(243, 156, 18) // Orange
          }
          pdf.setFontSize(11)
          pdf.setFont("helvetica", "bold")
        } else if (item.type === "data-row") {
          // Simple table row
          const parts = item.text.split("|")
          pdf.setTextColor(220, 220, 220)
          pdf.setFontSize(10)
          pdf.setFont("helvetica", "normal")

          // Period
          pdf.text(parts[0]?.trim() || "", margin + 5, yPos)

          // Performance
          pdf.text(parts[1]?.trim() || "", margin + 50, yPos)

          // Status with color
          if (parts[2]) {
            const statusParts = parts[2].split(":")
            const statusText = statusParts[0]?.trim() || ""
            const statusColor = statusParts[1]?.trim() || ""

            if (statusColor === "green") {
              pdf.setTextColor(39, 174, 96)
            } else if (statusColor === "red") {
              pdf.setTextColor(231, 76, 60)
            } else if (statusColor === "warning") {
              pdf.setTextColor(243, 156, 18)
            } else {
              pdf.setTextColor(220, 220, 220)
            }

            pdf.setFont("helvetica", "bold")
            pdf.text(statusText, margin + 100, yPos)
          }

          // Trend
          if (parts[3]) {
            const trendParts = parts[3].split(":")
            const trendText = trendParts[0]?.trim() || ""
            const trendColor = trendParts[1]?.trim() || ""

            if (trendColor === "green") {
              pdf.setTextColor(39, 174, 96)
            } else if (trendColor === "red") {
              pdf.setTextColor(231, 76, 60)
            } else {
              pdf.setTextColor(220, 220, 220)
            }

            pdf.text(trendText, margin + 140, yPos)
          }
        } else {
          // Regular text
          pdf.setTextColor(220, 220, 220)
          pdf.setFontSize(11)
          pdf.setFont("helvetica", "normal")

          const xPos = item.indent ? margin + 15 : margin + 5

          // Handle bullet points
          if (item.text.startsWith("•")) {
            pdf.setTextColor(249, 219, 111)
            pdf.text("•", xPos - 8, yPos)
            pdf.setTextColor(220, 220, 220)
            pdf.text(item.text.substring(1).trim(), xPos, yPos)
          } else {
            pdf.text(item.text, xPos, yPos)
          }
        }

        yPos += item.type === "summary-stat" ? 6 : item.type === "data-row" ? 5 : 5
      }

      yPos += 8
    }

    // Simple footer
    pdf.setTextColor(150, 150, 150)
    pdf.setFontSize(8)
    pdf.text("Generated by Analytics Dashboard", margin, pageHeight - 10)
    pdf.text(`Page 1`, pageWidth - margin - 15, pageHeight - 10)

    pdf.save(config.fileName)
  } catch (error) {
    console.error("Error exporting PDF:", error)
    throw new Error("Failed to export PDF. Please try again.")
  }
}

// Helper function to create tutor analytics PDF config
export const createTutorAnalyticsPDFConfig = (
  chartData: any[],
  selectedTeam: string,
  teams: any[],
  selectedRange: string,
  roleAccess: string,
): PDFExportConfig => {
  const validData = chartData.filter((item) => item.hasData && item.actualValue > 0)
  const allDataWithValues = chartData.filter((item) => item.actualValue >= 0)

  let avgScore = 0
  let maxScore = 0
  let minScore = 0

  if (validData.length > 0) {
    avgScore = validData.reduce((sum, item) => sum + item.actualValue, 0) / validData.length
    maxScore = Math.max(...validData.map((item) => item.actualValue))
    const allValues = allDataWithValues.map((item) => item.actualValue)
    minScore = allValues.length > 0 ? Math.min(...allValues) : 0
  }

  const activeMonths = validData.length
  const totalMonths = chartData.length
  const sections: PDFSection[] = []

  if (validData.length > 0 || allDataWithValues.some((item) => item.actualValue >= 0)) {
    // Overview section
    const overviewContent: PDFContent[] = [
      {
        type: "summary-stat",
        text: `Active Months: ${activeMonths} out of ${totalMonths}`,
      },
      {
        type: "summary-stat",
        text: `Average Score: ${avgScore.toFixed(1)}%`,
      },
      {
        type: "text",
        text: `Performance analysis covers ${totalMonths} months with ${activeMonths} months showing activity (${((activeMonths / totalMonths) * 100).toFixed(1)}% activity rate).`,
      },
    ]

    if (maxScore > 0) {
      const bestMonth = chartData.find((month) => month.actualValue === maxScore)
      overviewContent.push({
        type: "highlight",
        text: `Best Performance: ${bestMonth?.month} - ${maxScore.toFixed(1)}%`,
        color: "success",
      })
    }

    if (minScore >= 0 && maxScore !== minScore) {
      const lowestMonth = chartData.find((month) => month.actualValue === minScore)
      overviewContent.push({
        type: "highlight",
        text: `Lowest Performance: ${lowestMonth?.month} - ${minScore.toFixed(1)}%`,
        color: "danger",
      })
    }

    sections.push({
      type: "overview",
      title: "Performance Summary",
      content: overviewContent,
    })

    // Monthly breakdown
    const breakdownContent: PDFContent[] = chartData.map((month, index) => {
      let statusText = "Inactive"
      let statusColor = "gray"

      if (month.isHighlighted && month.actualValue > 0) {
        statusText = "Peak"
        statusColor = "warning"
      } else if (month.hasData && month.actualValue > 0) {
        statusText = month.actualValue >= avgScore ? "Above Avg" : "Below Avg"
        statusColor = month.actualValue >= avgScore ? "green" : "red"
      } else if (month.actualValue === 0) {
        statusText = "No Activity"
        statusColor = "red"
      }

      let trendText = ""
      let trendColor = "gray"

      if (index > 0 && month.hasData && chartData[index - 1].hasData) {
        const prevValue = chartData[index - 1].actualValue
        const change = month.actualValue - prevValue
        if (change > 0) {
          trendText = "↗"
          trendColor = "green"
        } else if (change < 0) {
          trendText = "↘"
          trendColor = "red"
        } else {
          trendText = "→"
          trendColor = "gray"
        }
      }

      const scoreText = month.hasData ? `${month.actualValue.toFixed(1)}%` : "No Data"

      return {
        type: "data-row" as const,
        text: `${month.month}|${scoreText}|${statusText}:${statusColor}${trendText ? `|${trendText}:${trendColor}` : ""}`,
      }
    })

    sections.push({
      type: "breakdown",
      title: "Monthly Performance",
      content: breakdownContent,
    })

    // Simple insights
    const insightsContent: PDFContent[] = []

    const recentMonths = chartData.slice(-3).filter((m) => m.hasData)
    const earlierMonths = chartData.slice(0, 3).filter((m) => m.hasData)

    if (recentMonths.length > 0 && earlierMonths.length > 0) {
      const recentAvg = recentMonths.reduce((sum, m) => sum + m.actualValue, 0) / recentMonths.length
      const earlierAvg = earlierMonths.reduce((sum, m) => sum + m.actualValue, 0) / earlierMonths.length
      const trend = recentAvg - earlierAvg

      if (trend > 2) {
        insightsContent.push({
          type: "text",
          text: `• Performance improving by ${trend.toFixed(1)}% in recent months`,
          indent: true,
        })
      } else if (trend < -2) {
        insightsContent.push({
          type: "text",
          text: `• Performance declining by ${Math.abs(trend).toFixed(1)}% in recent months`,
          indent: true,
        })
      } else {
        insightsContent.push({
          type: "text",
          text: "• Performance remains stable across periods",
          indent: true,
        })
      }
    }

    if (activeMonths >= 8) {
      insightsContent.push({
        type: "text",
        text: `• Good consistency with ${activeMonths} active months`,
        indent: true,
      })
    } else if (activeMonths > 0) {
      insightsContent.push({
        type: "text",
        text: `• Limited activity with ${activeMonths} active months`,
        indent: true,
      })
    }

    sections.push({
      type: "insights",
      title: "Key Insights",
      content: insightsContent,
    })
  } else {
    sections.push({
      type: "overview",
      title: "Performance Summary",
      content: [
        {
          type: "text",
          text: "No performance data available for the selected period.",
        },
      ],
    })
  }

  return {
    title: "Tutor Analytics Report",
    fileName: `tutor-analytics-${new Date().toISOString().split("T")[0]}.pdf`,
    metadata: {
      //   generatedOn: new Date().toLocaleDateString(),
      department:
        selectedTeam !== "all" ? teams.find((t) => t.id === selectedTeam)?.name || "Selected Team" : "",
      //   dateRange: selectedRange,
      //   role: roleAccess?.charAt(0).toUpperCase() + roleAccess?.slice(1),
    },
    sections,
  }
}

// Helper function to create cards analytics PDF config
export const createCardsAnalyticsPDFConfig = (
  chartData: any[],
  selectedTeam: string,
  teams: any[],
  roleAccess: string,
): PDFExportConfig => {
  const totalCards = chartData.reduce((sum, item) => sum + item.value, 0)
  const sections: PDFSection[] = []

  if (totalCards > 0) {
    const avgCardsPerWeek = chartData.length > 0 ? totalCards / chartData.length : 0
    const maxCardsInWeek = chartData.length > 0 ? Math.max(...chartData.map((item) => item.value)) : 0
    const activeWeeks = chartData.filter((week) => week.value > 0).length

    const overviewContent: PDFContent[] = [
      {
        type: "summary-stat",
        text: `Total Cards: ${totalCards} cards`,
      },
      {
        type: "summary-stat",
        text: `Weekly Average: ${avgCardsPerWeek.toFixed(1)} cards`,
      },
      {
        type: "text",
        text: `Card creation analysis over 6 weeks with ${activeWeeks} active weeks (${((activeWeeks / 6) * 100).toFixed(1)}% activity rate).`,
      },
    ]

    if (maxCardsInWeek > 0) {
      const bestWeek = chartData.find((week) => week.value === maxCardsInWeek)
      overviewContent.push({
        type: "highlight",
        text: `Best Week: ${bestWeek?.name} - ${maxCardsInWeek} cards`,
        color: "success",
      })
    }

    sections.push({
      type: "overview",
      title: "Cards Summary",
      content: overviewContent,
    })

    const breakdownContent: PDFContent[] = chartData.map((week, index) => {
      let trendText = ""
      let trendColor = "gray"

      if (index > 0) {
        const prevValue = chartData[index - 1].value
        if (week.value > prevValue) {
          trendText = "↗"
          trendColor = "green"
        } else if (week.value < prevValue) {
          trendText = "↘"
          trendColor = "red"
        } else {
          trendText = "→"
          trendColor = "gray"
        }
      }

      const statusText = week.value > avgCardsPerWeek ? "Above Avg" : week.value === 0 ? "No Activity" : "Below Avg"
      const statusColor = week.value > avgCardsPerWeek ? "green" : week.value === 0 ? "red" : "warning"

      return {
        type: "data-row" as const,
        // text: `${week.name}|${week.value} cards`,

        text: `${week.name}|${week.value} cards|${statusText}:${statusColor}${trendText ? `|${trendText}:${trendColor}` : ""}`,
      }
    })

    sections.push({
      type: "breakdown",
      title: "Weekly Breakdown",
      content: breakdownContent,
    })

    const insightsContent: PDFContent[] = []
    const trend = chartData[chartData.length - 1].value - chartData[0].value

    if (trend > 0) {
      insightsContent.push({
        type: "text",
        text: `• Card creation trending upward (+${trend} cards)`,
        indent: true,
      })
    } else if (trend < 0) {
      insightsContent.push({
        type: "text",
        text: `• Card creation declining (${trend} cards)`,
        indent: true,
      })
    } else {
      insightsContent.push({
        type: "text",
        text: "• Card creation remains stable",
        indent: true,
      })
    }

    const consistency = chartData.filter((week) => week.value > 0).length
    if (consistency === 6) {
      insightsContent.push({
        type: "text",
        text: "• Excellent consistency across all weeks",
        indent: true,
      })
    } else if (consistency >= 4) {
      insightsContent.push({
        type: "text",
        text: `• Good consistency with ${consistency} active weeks`,
        indent: true,
      })
    } else {
      insightsContent.push({
        type: "text",
        text: `• Sporadic activity with ${consistency} active weeks`,
        indent: true,
      })
    }

    sections.push({
      type: "insights",
      title: "Key Insights",
      content: insightsContent,
    })
  } else {
    sections.push({
      type: "overview",
      title: "Cards Summary",
      content: [
        {
          type: "text",
          text: "No cards created during the selected period.",
        },
      ],
    })
  }

  return {
    title: "Cards Analytics Report",
    fileName: `cards-analytics-${new Date().toISOString().split("T")[0]}.pdf`,
    metadata: {
      //   generatedOn: new Date().toLocaleDateString(),
      department:
        selectedTeam !== "all"
          ? teams.find((t: any) => t.id === selectedTeam)?.name || "Selected Team"
          : "",
      //   role: roleAccess?.charAt(0).toUpperCase() + roleAccess?.slice(1),
    },
    sections,
  }
}
