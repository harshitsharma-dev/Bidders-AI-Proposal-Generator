import PDFDocument from "pdfkit";

export const generatePDF = (proposal) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text("Tender Proposal", { align: "center" }).moveDown();
    doc.fontSize(14).text(`Tender: ${proposal.tenderTitle}`);
    doc.text(`Budget: ${proposal.budget}`);
    doc.text(`Timeline: ${proposal.timeline}`);
    doc.text(`Materials: ${proposal.materials.join(", ")}`);
    doc.text(`Status: ${proposal.status}`);
    doc.text(`Rank: ${proposal.rank}`);

    doc.end();
  });
};
