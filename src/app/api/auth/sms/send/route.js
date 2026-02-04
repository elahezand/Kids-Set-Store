import otpMOdal from "../../../../../../model/otp"
import connectToDB from "../../../../../../configs/db"
import axios from "axios"

export async function POST(req) {
  try {
    await connectToDB()
    const { phone } = await req.json()
    const code = Math.floor(10000 + Math.random() * 89999) 

    const body = {
      op: "pattern",
      user: "elizand724",
      pass: "917573657mM2$",
      fromNum: "3000505",
      toNum: phone,
      patternCode: "tzsbgnyknvvoab4",
      inputData: [{ "verification-code": code }],
    }

    const res = await axios.post("http://ippanel.com/api/select", body, {
      headers: { "Content-Type": "application/json" },
    })

    if (res.status === 200) {
      const expTime = Date.now() + 5 * 60 * 1000 // 5 min
      await otpMOdal.create({ phone, code, expTime })
      return Response.json(
        { message: "Code Sent Successfully :))" },
        { status: 200 }
      )
    } else {
      return Response.json(
        { message: "Unknown Error !!" },
        { status: 500 }
      )
    }
  } catch (err) {
    return Response.json({ message: "Server Error" }, { status: 500 })
  }
}
