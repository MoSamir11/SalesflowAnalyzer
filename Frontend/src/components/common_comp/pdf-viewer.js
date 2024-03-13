// import React from 'react';
// import { Page, Text, View,ReactPDF, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';

// const styles = StyleSheet.create({
//     page: {
//       flexDirection: 'row',
//       backgroundColor: '#E4E4E4'
//     },
//     section: {
//       margin: 10,
//       padding: 10,
//       flexGrow: 1
//     }

// });

// const MyDocument = () => (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <View style={styles.section}>
//           <Text>Section #1</Text>
//         </View>
//         <View style={styles.section}>
//           <Text>Section #2</Text>
//         </View>
//       </Page>
//     </Document>
//   );
//   ReactPDF.render(<MyDocument />, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
// const PDFView = () => {
//  return (
//  <div>
//     <PDFViewer>
//         <MyDocument />
//     </PDFViewer>
//  </div>
//  );
// };
// export default PDFView;