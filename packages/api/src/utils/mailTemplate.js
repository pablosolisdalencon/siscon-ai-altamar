const generateCollectionTable = (items) => {
    let rows = '';
    items.forEach(item => {
        rows += `
      <tr style="background-color:#eee;">
        <td style="padding:5px; border-bottom:1px solid #0080FF; text-align:center;">${item.fecha || ''}</td>
        <td style="padding:5px; border-bottom:1px solid #0080FF; text-align:center;">${item.n_cot || ''}</td>
        <td style="padding:5px; border-bottom:1px solid #0080FF; text-align:center;">${item.n_oc || ''}</td>
        <td style="padding:5px; border-bottom:1px solid #0080FF; text-align:center;">${item.n_factura || ''}</td>
        <td style="padding:5px; border-bottom:1px solid #0080FF; text-align:left;">${item.item || ''}</td>
        <td style="padding:5px; border-bottom:1px solid #0080FF; text-align:right;">$ ${(item.total || 0).toLocaleString()}</td>
        <td style="padding:5px; border-bottom:1px solid #0080FF; text-align:center;">${item.fecha_pago || ''}</td>
        <td style="padding:5px; border-bottom:1px solid #0080FF; text-align:center; color:red; font-weight:bold;">${item.daysOverdue > 0 ? item.daysOverdue : ''}</td>
      </tr>
    `;
    });

    const totalSum = items.reduce((acc, item) => acc + (item.total || 0), 0);

    return `
    <table style="width:100%; border-collapse:collapse; font-family:Verdana; font-size:10px; border:1px solid #0080FF;">
      <thead>
        <tr style="background-color:#0080FF; color:white; text-transform:uppercase;">
          <th style="padding:5px; text-align:center;">Fecha</th>
          <th style="padding:5px; text-align:center;">N° Cot</th>
          <th style="padding:5px; text-align:center;">N° OC</th>
          <th style="padding:5px; text-align:center;">N° Fac</th>
          <th style="padding:5px; text-align:left;">Item</th>
          <th style="padding:5px; text-align:right;">Total $</th>
          <th style="padding:5px; text-align:center;">F. Pago</th>
          <th style="padding:5px; text-align:center;">Mora</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr style="background-color:#0080FF; color:white; font-weight:bold;">
          <td colspan="5" style="padding:5px; text-align:right;">TOTAL PENDIENTE:</td>
          <td style="padding:5px; text-align:right;">$ ${totalSum.toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>
  `;
};

const generateCollectionEmail = ({ clientName, clientRut, message, items, companyName, companyEmail, companySignatureUrl }) => {
    const tableHtml = generateCollectionTable(items);

    return `
    <html>
      <head>
        <style>
          body { font-family: Verdana, sans-serif; font-size: 11px; color: #333; line-height: 1.5; }
          .container { padding: 20px; }
          .header { background-color: #3a3a3a; color: white; padding: 15px; text-align: center; margin-bottom: 20px; border-radius: 5px 5px 0 0; }
          .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
          .message { margin-bottom: 25px; white-space: pre-wrap; }
          h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${clientName} (${clientRut})</h2>
          </div>
          
          <div class="message">
            ${message || 'Estimado cliente, adjuntamos el detalle de sus pagos pendientes a la fecha.'}
          </div>

          <div style="width: 100%;">
            ${tableHtml}
          </div>

          <div class="footer">
            <p>Atentamente,</p>
            <p><strong>${companyName}</strong></p>
            ${companySignatureUrl ? `<img src="${companySignatureUrl}" alt="Firma" style="max-width: 300px; margin-top: 10px;" />` : ''}
            <p style="font-size: 9px; color: #777; margin-top: 20px;">
              Este es un correo automático generado por SISCON-AI. Por favor no responda a este mensaje directamente.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

module.exports = { generateCollectionEmail };
