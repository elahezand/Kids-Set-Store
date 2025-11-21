const request = require("request")
import otpMOdal from "../../../../../../model/otp"
import connectToDB from "../../../../../../db/db"

export async function POST(req) {
    connectToDB()
    const { phone } = await req.json()
    const code = Math.floor(Math.random() * 99999)

    request.post({
        url: 'http://ippanel.com/api/select',
        body: {
            "op": "pattern",
            "user": "elizand724",
            "pass": "917573657mM2$",
            "fromNum": "3000505",
            "toNum": phone,
            "patternCode": "tzsbgnyknvvoab4",
            "inputData": [
                { "verification-code": code }
            ]
        },
        json: true,
    },
        async function (error, response, body) {
            const date = new Date()
            const expTime = date.getTime() + 300000

            if (!error && response.statusCode === 200) {
                await otpMOdal.create(
                    {
                        phone,
                        code,
                        expTime
                    })

                Response.json({ message: "Code Sent Successfully :))" }, { status: 200 })
            } else {
                Response.json({ message: "Unknown Error !!" }, { status: 500 })
            }
        });

    return Response.json({ message: "Code Sent Successfully :))" }, { status: 200 })

}


