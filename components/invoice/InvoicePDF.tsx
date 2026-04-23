"use client"

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"
import type { Invoice } from "@/types"

Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: "/fonts/NotoSansKR-Regular.woff", fontWeight: 400 },
    { src: "/fonts/NotoSansKR-Bold.woff", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 10,
    padding: 40,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  // 헤더
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
    paddingBottom: 12,
  },
  headerLabel: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 400,
    color: "#444444",
  },
  // 메타 (발행일/유효기간)
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    alignItems: "flex-end",
  },
  metaLabel: {
    fontSize: 8,
    color: "#888888",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 400,
  },
  // 고객 정보
  clientSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 8,
    color: "#888888",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  clientName: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 10,
    color: "#555555",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    marginBottom: 16,
    marginTop: 4,
  },
  // 항목 테이블
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  colName: { flex: 1 },
  colQty: { width: 40, textAlign: "right" },
  colUnitPrice: { width: 80, textAlign: "right" },
  colAmount: { width: 80, textAlign: "right" },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 700,
    color: "#555555",
  },
  tableBodyText: {
    fontSize: 10,
  },
  tableNoteText: {
    fontSize: 8,
    color: "#888888",
    marginTop: 2,
  },
  // 합계
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#111111",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 700,
  },
  // 비고
  noteSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  noteText: {
    fontSize: 10,
    color: "#555555",
    lineHeight: 1.5,
  },
  // 페이지 번호
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  footerText: {
    fontSize: 8,
    color: "#aaaaaa",
  },
})

function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`
}

interface InvoiceDocumentProps {
  invoice: Invoice
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  return (
    <Document
      title={invoice.title}
      author="견적서 관리"
      language="ko"
    >
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>견적서</Text>
          <Text style={styles.headerTitle}>{invoice.title}</Text>
        </View>

        {/* 발행일 / 유효기간 */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>발행일</Text>
            <Text style={styles.metaValue}>{invoice.issueDate}</Text>
          </View>
          {invoice.expiryDate && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>유효기간</Text>
              <Text style={styles.metaValue}>{invoice.expiryDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* 고객 정보 */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionLabel}>수신</Text>
          <Text style={styles.clientName}>{invoice.clientName}</Text>
          {invoice.clientEmail && (
            <Text style={styles.clientEmail}>{invoice.clientEmail}</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* 견적 항목 테이블 */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colName, styles.tableHeaderText]}>항목</Text>
          <Text style={[styles.colQty, styles.tableHeaderText]}>수량</Text>
          <Text style={[styles.colUnitPrice, styles.tableHeaderText]}>단가</Text>
          <Text style={[styles.colAmount, styles.tableHeaderText]}>금액</Text>
        </View>

        {invoice.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.colName}>
              <Text style={styles.tableBodyText}>{item.itemName}</Text>
              {item.note && (
                <Text style={styles.tableNoteText}>{item.note}</Text>
              )}
            </View>
            <Text style={[styles.colQty, styles.tableBodyText]}>
              {item.quantity}
            </Text>
            <Text style={[styles.colUnitPrice, styles.tableBodyText]}>
              {formatKRW(item.unitPrice)}
            </Text>
            <Text style={[styles.colAmount, styles.tableBodyText]}>
              {formatKRW(item.amount)}
            </Text>
          </View>
        ))}

        {/* 합계 */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>총 견적 금액</Text>
          <Text style={styles.totalValue}>{formatKRW(invoice.totalAmount)}</Text>
        </View>

        {/* 비고 */}
        {invoice.note && (
          <View style={styles.noteSection}>
            <Text style={styles.sectionLabel}>비고</Text>
            <Text style={styles.noteText}>{invoice.note}</Text>
          </View>
        )}

        {/* 페이지 번호 */}
        <View style={styles.footer} fixed>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
            }
          />
        </View>
      </Page>
    </Document>
  )
}

export type { InvoiceDocumentProps }
