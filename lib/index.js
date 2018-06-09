const pdfKit = require("pdfkit");
const moment = require("moment");
const numeral = require("numeral");
const i18n = require("./i18n");

const TEXT_SIZE = 8;
const CONTENT_LEFT_PADDING = 50;

function PDFInvoice({ company, customer, items }) {
  const date = new Date();
  const charge = {
    createdAt: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`,
    amount: items.reduce((acc, item) => acc + item.amount, 0),
    quantity: items.reduce((acc, item) => acc + item.quantity, 0)
  };
  const doc = new pdfKit({ size: "A4", margin: 50 });

  doc.fillColor("#333333");

  const translate = i18n[PDFInvoice.lang];
  moment.locale(PDFInvoice.lang);

  const divMaxWidth = 550;
  const table = {
    x: CONTENT_LEFT_PADDING,
    y: 180, //table height
    inc: 50
  };

  return {
    genHeader() {
      const headerHeight = 50;
      doc.fontSize(20).text(company.name, CONTENT_LEFT_PADDING, headerHeight);

      const borderOffset = doc.currentLineHeight() + 70;

      doc
        .fontSize(16)
        .fillColor("#cccccc")
        .text(
          moment().format("MMMM, DD, YYYY"),
          CONTENT_LEFT_PADDING,
          headerHeight,
          {
            align: "right"
          }
        )
        .fillColor("#333333");
      doc
        .strokeColor("#cccccc")
        .moveTo(CONTENT_LEFT_PADDING, borderOffset)
        .lineTo(divMaxWidth, borderOffset);
    },

    genFooter() {
      doc.fontSize(TEXT_SIZE).text(company.payable, CONTENT_LEFT_PADDING, 650);
    },

    genCustomerInfos() {
      const headerHeight = 100;
      doc.fontSize(TEXT_SIZE).text("To:", CONTENT_LEFT_PADDING, headerHeight);
      doc.text(`${customer.name}`);
      doc.text(`${customer.address}`);
      doc.text(`${customer.email}`);
      if (customer.for) {
        doc.text(`For: ${customer.for}`, CONTENT_LEFT_PADDING, headerHeight, {
          align: "right"
        });
      }
    },

    genTableHeaders() {
      ["amount", "quantity", "description"].forEach((text, i) => {
        doc
          .fontSize(TEXT_SIZE)
          .text(translate[text], table.x + i * table.inc, table.y);
      });
    },

    genTableRow() {
      items
        .map(item =>
          Object.assign({}, item, {
            amount: numeral(item.amount).format("$0,00.00")
          })
        )
        .forEach((item, itemIndex) => {
          ["amount", "quantity", "description"].forEach((field, i) => {
            doc
              .fontSize(TEXT_SIZE)
              .text(
                item[field],
                table.x + i * table.inc,
                table.y + TEXT_SIZE + 6 + itemIndex * 20
              );
          });
        });

      const heightOffset = table.y + TEXT_SIZE + items.length * 20;
      console.log(heightOffset);
      doc
        .moveTo(table.x, heightOffset)
        .lineTo(divMaxWidth, heightOffset)
        .stroke();

      doc
        .fontSize(TEXT_SIZE)
        .text(
          numeral(charge.amount).format("$0,00.00"),
          table.x + 0 * table.inc,
          heightOffset + TEXT_SIZE
        );
      doc
        .fontSize(TEXT_SIZE)
        .text(
          numeral(charge.quantity).format("00.00"),
          table.x + 1 * table.inc,
          heightOffset + TEXT_SIZE
        );
    },

    genTableLines() {
      const offset = doc.currentLineHeight() + 2;
      doc
        .moveTo(table.x, table.y + offset)
        .lineTo(divMaxWidth, table.y + offset)
        .stroke();
    },

    generate() {
      this.genHeader();
      this.genCustomerInfos();
      this.genTableHeaders();
      this.genTableLines();
      this.genTableRow();
      this.genFooter();
      doc.end();
    },

    get pdfkitDoc() {
      return doc;
    }
  };
}

PDFInvoice.lang = "en_US";

module.exports = PDFInvoice;
