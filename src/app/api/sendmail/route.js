import { sendVerificationMail } from "@/src/utils/sendMail";
import { sendOrderToWhatsApp } from "@/src/utils/sendWhatsApp";

export async function POST(request) {
  try {
    const { billingDetails, productList, invoice } = await request.json();

    // 1) Email — must succeed for order to be considered "placed"
    await sendVerificationMail({ billingDetails, invoice });

    // 2) WhatsApp — best-effort, never blocks email success
    //    👇 ADD-CALL-HERE — this is the line where the WhatsApp send is invoked
    try {
      const total = (productList || []).reduce(
        (acc, it) => acc + Math.round(it.price - (it.price * (it.discount || 0)) / 100) * (it.count || 0),
        0
      );
      const order = {
        id: `ORD-${Date.now()}`,
        customer: {
          name: billingDetails.name,
          email: billingDetails.email,
          phone: billingDetails.phone,
          address: [billingDetails.address, billingDetails.city, billingDetails.state, billingDetails.zip]
            .filter(Boolean)
            .join(", "),
        },
        items: productList,
        total,
        paymentStatus: "Pay on delivery / to be confirmed",
      };

      // Reuse the same PDF the email already used. invoice is base64; convert to Buffer.
      const pdfBuffer = invoice ? Buffer.from(invoice, "base64") : undefined;

      await sendOrderToWhatsApp(order, { pdfBuffer, pdfName: `invoice-${order.id}.pdf` });
    } catch (waErr) {
      // log only, do not throw
      console.error("[whatsapp-invoice] failed:", waErr.message, waErr.response || "");
    }

    return Response.json({
      message: "Order placed successfully",
      status: "success",
    });
  } catch (err) {
    console.error("Mail send failed:", err);
    return Response.json(
      { message: err.message || "Failed to send order email", status: "error" },
      { status: 500 }
    );
  }
}
