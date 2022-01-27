const baseURL = 'https://koltzedek.breezechms.com/api/'
apiKey = '0c9b2cb96e3593dbe9dcb74b029f8b03'
formID = '323268'
const entriesPath = `forms/list_form_entries?form_id=${formID}&details=1`

const fetchYahrzeitFormEntries = () => {
    const configObj = {
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
          },
      
    }
    fetch(baseURL + entriesPath, configObj)
    .then(resp => resp.json())
    .then(json => console.log(json))
}

fetchYahrzeitFormEntries()

const formFieldKey = [
    {
        "id": "26471296",
        "oid": "109330",
        "field_id": "2092220836",
        "profile_section_id": "0",  
        "field_type": "name",
        "name": "Name",
        "position": "6",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471298",
        "oid": "109330",
        "field_id": "2092220837",
        "profile_section_id": "0",
        "field_type": "single_line",
        "name": "Email",
        "position": "7",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471300",
        "oid": "109330",
        "field_id": "2092220838",
        "profile_section_id": "0",
        "field_type": "single_line",
        "name": "Phone",
        "position": "8",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471302",
        "oid": "109330",
        "field_id": "2092220839",
        "profile_section_id": "0",
        "field_type": "title",
        "name": "Yahrzeit Information",
        "position": "9",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471304",
        "oid": "109330",
        "field_id": "2092220840",
        "profile_section_id": "0",
        "field_type": "single_line",
        "name": "English name of deceased",
        "position": "10",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471306",
        "oid": "109330",
        "field_id": "2092220841",
        "profile_section_id": "0",
        "field_type": "single_line",
        "name": "Hebrew/Jewish name of deceased",
        "position": "11",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471308",
        "oid": "109330",
        "field_id": "2092220842",
        "profile_section_id": "0",
        "field_type": "single_line",
        "name": "Relationship to you (e.g., parent, beloved friend, etc.)",
        "position": "12",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471310",
        "oid": "109330",
        "field_id": "2092220843",
        "profile_section_id": "0",
        "field_type": "paragraph",
        "name": "<strong>We ask that you enter both the Hebrew and Gregorian date of death</strong> so we can track the yahrzeit annually. <a href=\"https://www.hebcal.com/converter\" target=\"_blank\">Click here to use this handy date converter</a> so that you can record both the Hebrew and Gregorian dates below.<br /><br />While both dates may hold significance for you personally,<strong> we ask that you choose which date you would like the yahrzeit observed at Kol Tzedek.</strong> Please indicate your preference below.",
        "position": "13",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471312",
        "oid": "109330",
        "field_id": "2092220853",
        "profile_section_id": "0",
        "field_type": "multiple_choice",
        "name": "I prefer to have the yahrzeit observed on the:",
        "position": "14",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": [
            {
                "id": "36258658",
                "oid": "109330",
                "option_id": "403",
                "profile_field_id": "2092220853",
                "name": "Gregorian Date",
                "position": "15",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258660",
                "oid": "109330",
                "option_id": "404",
                "profile_field_id": "2092220853",
                "name": "Hebrew Date",
                "position": "16",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            }
        ]
    },
    {
        "id": "26471314",
        "oid": "109330",
        "field_id": "2092220844",
        "profile_section_id": "0",
        "field_type": "date",
        "name": "Gregorian Date",
        "position": "17",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471316",
        "oid": "109330",
        "field_id": "2092220845",
        "profile_section_id": "0",
        "field_type": "dropdown",
        "name": "Hebrew Month",
        "position": "18",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": [
            {
                "id": "36258662",
                "oid": "109330",
                "option_id": "357",
                "profile_field_id": "2092220845",
                "name": "Tishrei",
                "position": "19",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258664",
                "oid": "109330",
                "option_id": "358",
                "profile_field_id": "2092220845",
                "name": "Cheshvan",
                "position": "20",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258666",
                "oid": "109330",
                "option_id": "359",
                "profile_field_id": "2092220845",
                "name": "Kislev",
                "position": "21",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258668",
                "oid": "109330",
                "option_id": "363",
                "profile_field_id": "2092220845",
                "name": "Tevet",
                "position": "22",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258670",
                "oid": "109330",
                "option_id": "364",
                "profile_field_id": "2092220845",
                "name": "Sh'vat",
                "position": "23",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258672",
                "oid": "109330",
                "option_id": "365",
                "profile_field_id": "2092220845",
                "name": "Adar",
                "position": "24",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258674",
                "oid": "109330",
                "option_id": "456",
                "profile_field_id": "2092220845",
                "name": "Adar I",
                "position": "25",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258676",
                "oid": "109330",
                "option_id": "366",
                "profile_field_id": "2092220845",
                "name": "Adar II",
                "position": "26",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258678",
                "oid": "109330",
                "option_id": "367",
                "profile_field_id": "2092220845",
                "name": "Nisan",
                "position": "27",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258680",
                "oid": "109330",
                "option_id": "368",
                "profile_field_id": "2092220845",
                "name": "Iyyar",
                "position": "28",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258682",
                "oid": "109330",
                "option_id": "369",
                "profile_field_id": "2092220845",
                "name": "Sivan",
                "position": "29",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258684",
                "oid": "109330",
                "option_id": "370",
                "profile_field_id": "2092220845",
                "name": "Tamuz",
                "position": "30",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258686",
                "oid": "109330",
                "option_id": "371",
                "profile_field_id": "2092220845",
                "name": "Av",
                "position": "31",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258688",
                "oid": "109330",
                "option_id": "372",
                "profile_field_id": "2092220845",
                "name": "Elul",
                "position": "32",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            }
        ]
    },
    {
        "id": "26471318",
        "oid": "109330",
        "field_id": "2092220846",
        "profile_section_id": "0",
        "field_type": "dropdown",
        "name": "Hebrew Day",
        "position": "33",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": [
            {
                "id": "36258690",
                "oid": "109330",
                "option_id": "360",
                "profile_field_id": "2092220846",
                "name": "1",
                "position": "34",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258692",
                "oid": "109330",
                "option_id": "361",
                "profile_field_id": "2092220846",
                "name": "2",
                "position": "35",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258694",
                "oid": "109330",
                "option_id": "362",
                "profile_field_id": "2092220846",
                "name": "3",
                "position": "36",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258696",
                "oid": "109330",
                "option_id": "373",
                "profile_field_id": "2092220846",
                "name": "4",
                "position": "37",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258698",
                "oid": "109330",
                "option_id": "374",
                "profile_field_id": "2092220846",
                "name": "5",
                "position": "38",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258700",
                "oid": "109330",
                "option_id": "375",
                "profile_field_id": "2092220846",
                "name": "6",
                "position": "39",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258702",
                "oid": "109330",
                "option_id": "376",
                "profile_field_id": "2092220846",
                "name": "7",
                "position": "40",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258704",
                "oid": "109330",
                "option_id": "377",
                "profile_field_id": "2092220846",
                "name": "8",
                "position": "41",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258706",
                "oid": "109330",
                "option_id": "378",
                "profile_field_id": "2092220846",
                "name": "9",
                "position": "42",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258708",
                "oid": "109330",
                "option_id": "379",
                "profile_field_id": "2092220846",
                "name": "10",
                "position": "43",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258710",
                "oid": "109330",
                "option_id": "380",
                "profile_field_id": "2092220846",
                "name": "11",
                "position": "44",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258712",
                "oid": "109330",
                "option_id": "381",
                "profile_field_id": "2092220846",
                "name": "12",
                "position": "45",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258714",
                "oid": "109330",
                "option_id": "382",
                "profile_field_id": "2092220846",
                "name": "13",
                "position": "46",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258716",
                "oid": "109330",
                "option_id": "383",
                "profile_field_id": "2092220846",
                "name": "14",
                "position": "47",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258718",
                "oid": "109330",
                "option_id": "384",
                "profile_field_id": "2092220846",
                "name": "15",
                "position": "48",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258720",
                "oid": "109330",
                "option_id": "385",
                "profile_field_id": "2092220846",
                "name": "16",
                "position": "49",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258722",
                "oid": "109330",
                "option_id": "386",
                "profile_field_id": "2092220846",
                "name": "17",
                "position": "50",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258724",
                "oid": "109330",
                "option_id": "387",
                "profile_field_id": "2092220846",
                "name": "18",
                "position": "51",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258726",
                "oid": "109330",
                "option_id": "388",
                "profile_field_id": "2092220846",
                "name": "19",
                "position": "52",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258728",
                "oid": "109330",
                "option_id": "389",
                "profile_field_id": "2092220846",
                "name": "20",
                "position": "53",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258730",
                "oid": "109330",
                "option_id": "390",
                "profile_field_id": "2092220846",
                "name": "21",
                "position": "54",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258732",
                "oid": "109330",
                "option_id": "391",
                "profile_field_id": "2092220846",
                "name": "22",
                "position": "55",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258734",
                "oid": "109330",
                "option_id": "392",
                "profile_field_id": "2092220846",
                "name": "23",
                "position": "56",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258736",
                "oid": "109330",
                "option_id": "393",
                "profile_field_id": "2092220846",
                "name": "24",
                "position": "57",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258738",
                "oid": "109330",
                "option_id": "394",
                "profile_field_id": "2092220846",
                "name": "25",
                "position": "58",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258740",
                "oid": "109330",
                "option_id": "395",
                "profile_field_id": "2092220846",
                "name": "26",
                "position": "59",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258742",
                "oid": "109330",
                "option_id": "396",
                "profile_field_id": "2092220846",
                "name": "27",
                "position": "60",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258744",
                "oid": "109330",
                "option_id": "397",
                "profile_field_id": "2092220846",
                "name": "28",
                "position": "61",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258746",
                "oid": "109330",
                "option_id": "398",
                "profile_field_id": "2092220846",
                "name": "29",
                "position": "62",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            },
            {
                "id": "36258748",
                "oid": "109330",
                "option_id": "399",
                "profile_field_id": "2092220846",
                "name": "30",
                "position": "63",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            }
        ]
    },
    {
        "id": "26471320",
        "oid": "109330",
        "field_id": "2092220847",
        "profile_section_id": "0",
        "field_type": "single_line",
        "name": "Hebrew Year (e.g., 5781)",
        "position": "64",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471322",
        "oid": "109330",
        "field_id": "2092220848",
        "profile_section_id": "0",
        "field_type": "single_line",
        "name": "Additional Comments. Is there anything else you would like us to know?",
        "position": "65",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471324",
        "oid": "109330",
        "field_id": "2092220849",
        "profile_section_id": "0",
        "field_type": "title",
        "name": "Donation",
        "position": "66",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471326",
        "oid": "109330",
        "field_id": "2092220850",
        "profile_section_id": "0",
        "field_type": "paragraph",
        "name": "There is a custom to give <em>tzedakah </em>in memory of a loved one. <strong>You are invited to make a donation to Kol Tzedek in honor of the person you are remembering.</strong> To continue without a donation, please leave the space blank and click submit.",
        "position": "67",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": []
    },
    {
        "id": "26471328",
        "oid": "109330",
        "field_id": "2092220851",
        "profile_section_id": "0",
        "field_type": "amount",
        "name": "",
        "position": "68",
        "profile_id": "5fecbd0126e44",
        "created_on": "2020-12-30 12:46:41",
        "options": [
            {
                "id": "36258750",
                "oid": "109330",
                "option_id": "400",
                "profile_field_id": "2092220851",
                "name": "",
                "position": "69",
                "profile_id": "5fecbd0126e44",
                "created_on": "2020-12-30 12:46:41"
            }
        ]
    }
]












const responseObj = {
    "id": "95085996",
    "oid": "109330",
    "form_id": "323268",
    "created_on": "2020-10-30 08:26:19",
    "person_id": "24979104",
    "response": {
        "2092220836": {
            "id": "5503554",
            "oid": "109330",
            "first_name": "Ari Lev",
            "last_name": "Fornari",
            "created_on": "2020-10-30 08:26:19"
        },
        "2092220837": "rabbi@kol-tzedek.org",
        "2092220838": "9173700304",
        "2092220840": "Alice Notrica Fornari",
        "2092220841": "",
        "2092220842": "Grandmother",
        "2092220853": {
            "value": "404",
            "name": null
        },
        "2092220844": "01/03/1983",
        "2092220845": {
            "value": "363",
            "name": null
        },
        "2092220846": {
            "value": "387",
            "name": null
        },
        "2092220847": "5743",
        "2092220848": "",
        "2092220851": " ($0)"
    }
}