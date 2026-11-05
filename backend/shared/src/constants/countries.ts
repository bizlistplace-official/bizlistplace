export interface GlobalCountry {
  code: string;
  name: string;
  flag: string;
  slug: string;
  currency: string;
  phonecode: string;
  isPopular?: boolean;
}

export const POPULAR_COUNTRY_CODES = ['PK', 'US', 'GB', 'AE', 'SA', 'CA', 'AU', 'DE', 'FR', 'IN', 'TR', 'MY', 'SG', 'NZ'] as const;

export const ALL_GLOBAL_COUNTRIES: GlobalCountry[] = [
  {
    "code": "PK",
    "name": "Pakistan",
    "flag": "🇵🇰",
    "slug": "pakistan",
    "currency": "PKR",
    "phonecode": "92",
    "isPopular": true
  },
  {
    "code": "US",
    "name": "United States",
    "flag": "🇺🇸",
    "slug": "united-states",
    "currency": "USD",
    "phonecode": "1",
    "isPopular": true
  },
  {
    "code": "GB",
    "name": "United Kingdom",
    "flag": "🇬🇧",
    "slug": "united-kingdom",
    "currency": "GBP",
    "phonecode": "44",
    "isPopular": true
  },
  {
    "code": "AE",
    "name": "United Arab Emirates",
    "flag": "🇦🇪",
    "slug": "united-arab-emirates",
    "currency": "AED",
    "phonecode": "971",
    "isPopular": true
  },
  {
    "code": "SA",
    "name": "Saudi Arabia",
    "flag": "🇸🇦",
    "slug": "saudi-arabia",
    "currency": "SAR",
    "phonecode": "966",
    "isPopular": true
  },
  {
    "code": "CA",
    "name": "Canada",
    "flag": "🇨🇦",
    "slug": "canada",
    "currency": "CAD",
    "phonecode": "1",
    "isPopular": true
  },
  {
    "code": "AU",
    "name": "Australia",
    "flag": "🇦🇺",
    "slug": "australia",
    "currency": "AUD",
    "phonecode": "61",
    "isPopular": true
  },
  {
    "code": "DE",
    "name": "Germany",
    "flag": "🇩🇪",
    "slug": "germany",
    "currency": "EUR",
    "phonecode": "49",
    "isPopular": true
  },
  {
    "code": "FR",
    "name": "France",
    "flag": "🇫🇷",
    "slug": "france",
    "currency": "EUR",
    "phonecode": "33",
    "isPopular": true
  },
  {
    "code": "IN",
    "name": "India",
    "flag": "🇮🇳",
    "slug": "india",
    "currency": "INR",
    "phonecode": "91",
    "isPopular": true
  },
  {
    "code": "TR",
    "name": "Turkey",
    "flag": "🇹🇷",
    "slug": "turkey",
    "currency": "TRY",
    "phonecode": "90",
    "isPopular": true
  },
  {
    "code": "MY",
    "name": "Malaysia",
    "flag": "🇲🇾",
    "slug": "malaysia",
    "currency": "MYR",
    "phonecode": "60",
    "isPopular": true
  },
  {
    "code": "SG",
    "name": "Singapore",
    "flag": "🇸🇬",
    "slug": "singapore",
    "currency": "SGD",
    "phonecode": "65",
    "isPopular": true
  },
  {
    "code": "NZ",
    "name": "New Zealand",
    "flag": "🇳🇿",
    "slug": "new-zealand",
    "currency": "NZD",
    "phonecode": "64",
    "isPopular": true
  },
  {
    "code": "AF",
    "name": "Afghanistan",
    "flag": "🇦🇫",
    "slug": "afghanistan",
    "currency": "AFN",
    "phonecode": "93",
    "isPopular": false
  },
  {
    "code": "AX",
    "name": "Aland Islands",
    "flag": "🇦🇽",
    "slug": "aland-islands",
    "currency": "EUR",
    "phonecode": "+358-18",
    "isPopular": false
  },
  {
    "code": "AL",
    "name": "Albania",
    "flag": "🇦🇱",
    "slug": "albania",
    "currency": "ALL",
    "phonecode": "355",
    "isPopular": false
  },
  {
    "code": "DZ",
    "name": "Algeria",
    "flag": "🇩🇿",
    "slug": "algeria",
    "currency": "DZD",
    "phonecode": "213",
    "isPopular": false
  },
  {
    "code": "AS",
    "name": "American Samoa",
    "flag": "🇦🇸",
    "slug": "american-samoa",
    "currency": "USD",
    "phonecode": "+1-684",
    "isPopular": false
  },
  {
    "code": "AD",
    "name": "Andorra",
    "flag": "🇦🇩",
    "slug": "andorra",
    "currency": "EUR",
    "phonecode": "376",
    "isPopular": false
  },
  {
    "code": "AO",
    "name": "Angola",
    "flag": "🇦🇴",
    "slug": "angola",
    "currency": "AOA",
    "phonecode": "244",
    "isPopular": false
  },
  {
    "code": "AI",
    "name": "Anguilla",
    "flag": "🇦🇮",
    "slug": "anguilla",
    "currency": "XCD",
    "phonecode": "+1-264",
    "isPopular": false
  },
  {
    "code": "AQ",
    "name": "Antarctica",
    "flag": "🇦🇶",
    "slug": "antarctica",
    "currency": "AAD",
    "phonecode": "672",
    "isPopular": false
  },
  {
    "code": "AG",
    "name": "Antigua And Barbuda",
    "flag": "🇦🇬",
    "slug": "antigua-and-barbuda",
    "currency": "XCD",
    "phonecode": "+1-268",
    "isPopular": false
  },
  {
    "code": "AR",
    "name": "Argentina",
    "flag": "🇦🇷",
    "slug": "argentina",
    "currency": "ARS",
    "phonecode": "54",
    "isPopular": false
  },
  {
    "code": "AM",
    "name": "Armenia",
    "flag": "🇦🇲",
    "slug": "armenia",
    "currency": "AMD",
    "phonecode": "374",
    "isPopular": false
  },
  {
    "code": "AW",
    "name": "Aruba",
    "flag": "🇦🇼",
    "slug": "aruba",
    "currency": "AWG",
    "phonecode": "297",
    "isPopular": false
  },
  {
    "code": "AT",
    "name": "Austria",
    "flag": "🇦🇹",
    "slug": "austria",
    "currency": "EUR",
    "phonecode": "43",
    "isPopular": false
  },
  {
    "code": "AZ",
    "name": "Azerbaijan",
    "flag": "🇦🇿",
    "slug": "azerbaijan",
    "currency": "AZN",
    "phonecode": "994",
    "isPopular": false
  },
  {
    "code": "BH",
    "name": "Bahrain",
    "flag": "🇧🇭",
    "slug": "bahrain",
    "currency": "BHD",
    "phonecode": "973",
    "isPopular": false
  },
  {
    "code": "BD",
    "name": "Bangladesh",
    "flag": "🇧🇩",
    "slug": "bangladesh",
    "currency": "BDT",
    "phonecode": "880",
    "isPopular": false
  },
  {
    "code": "BB",
    "name": "Barbados",
    "flag": "🇧🇧",
    "slug": "barbados",
    "currency": "BBD",
    "phonecode": "+1-246",
    "isPopular": false
  },
  {
    "code": "BY",
    "name": "Belarus",
    "flag": "🇧🇾",
    "slug": "belarus",
    "currency": "BYN",
    "phonecode": "375",
    "isPopular": false
  },
  {
    "code": "BE",
    "name": "Belgium",
    "flag": "🇧🇪",
    "slug": "belgium",
    "currency": "EUR",
    "phonecode": "32",
    "isPopular": false
  },
  {
    "code": "BZ",
    "name": "Belize",
    "flag": "🇧🇿",
    "slug": "belize",
    "currency": "BZD",
    "phonecode": "501",
    "isPopular": false
  },
  {
    "code": "BJ",
    "name": "Benin",
    "flag": "🇧🇯",
    "slug": "benin",
    "currency": "XOF",
    "phonecode": "229",
    "isPopular": false
  },
  {
    "code": "BM",
    "name": "Bermuda",
    "flag": "🇧🇲",
    "slug": "bermuda",
    "currency": "BMD",
    "phonecode": "+1-441",
    "isPopular": false
  },
  {
    "code": "BT",
    "name": "Bhutan",
    "flag": "🇧🇹",
    "slug": "bhutan",
    "currency": "BTN",
    "phonecode": "975",
    "isPopular": false
  },
  {
    "code": "BO",
    "name": "Bolivia",
    "flag": "🇧🇴",
    "slug": "bolivia",
    "currency": "BOB",
    "phonecode": "591",
    "isPopular": false
  },
  {
    "code": "BQ",
    "name": "Bonaire, Sint Eustatius and Saba",
    "flag": "🇧🇶",
    "slug": "bonaire-sint-eustatius-and-saba",
    "currency": "USD",
    "phonecode": "599",
    "isPopular": false
  },
  {
    "code": "BA",
    "name": "Bosnia and Herzegovina",
    "flag": "🇧🇦",
    "slug": "bosnia-and-herzegovina",
    "currency": "BAM",
    "phonecode": "387",
    "isPopular": false
  },
  {
    "code": "BW",
    "name": "Botswana",
    "flag": "🇧🇼",
    "slug": "botswana",
    "currency": "BWP",
    "phonecode": "267",
    "isPopular": false
  },
  {
    "code": "BV",
    "name": "Bouvet Island",
    "flag": "🇧🇻",
    "slug": "bouvet-island",
    "currency": "NOK",
    "phonecode": "0055",
    "isPopular": false
  },
  {
    "code": "BR",
    "name": "Brazil",
    "flag": "🇧🇷",
    "slug": "brazil",
    "currency": "BRL",
    "phonecode": "55",
    "isPopular": false
  },
  {
    "code": "IO",
    "name": "British Indian Ocean Territory",
    "flag": "🇮🇴",
    "slug": "british-indian-ocean-territory",
    "currency": "USD",
    "phonecode": "246",
    "isPopular": false
  },
  {
    "code": "BN",
    "name": "Brunei",
    "flag": "🇧🇳",
    "slug": "brunei",
    "currency": "BND",
    "phonecode": "673",
    "isPopular": false
  },
  {
    "code": "BG",
    "name": "Bulgaria",
    "flag": "🇧🇬",
    "slug": "bulgaria",
    "currency": "BGN",
    "phonecode": "359",
    "isPopular": false
  },
  {
    "code": "BF",
    "name": "Burkina Faso",
    "flag": "🇧🇫",
    "slug": "burkina-faso",
    "currency": "XOF",
    "phonecode": "226",
    "isPopular": false
  },
  {
    "code": "BI",
    "name": "Burundi",
    "flag": "🇧🇮",
    "slug": "burundi",
    "currency": "BIF",
    "phonecode": "257",
    "isPopular": false
  },
  {
    "code": "KH",
    "name": "Cambodia",
    "flag": "🇰🇭",
    "slug": "cambodia",
    "currency": "KHR",
    "phonecode": "855",
    "isPopular": false
  },
  {
    "code": "CM",
    "name": "Cameroon",
    "flag": "🇨🇲",
    "slug": "cameroon",
    "currency": "XAF",
    "phonecode": "237",
    "isPopular": false
  },
  {
    "code": "CV",
    "name": "Cape Verde",
    "flag": "🇨🇻",
    "slug": "cape-verde",
    "currency": "CVE",
    "phonecode": "238",
    "isPopular": false
  },
  {
    "code": "KY",
    "name": "Cayman Islands",
    "flag": "🇰🇾",
    "slug": "cayman-islands",
    "currency": "KYD",
    "phonecode": "+1-345",
    "isPopular": false
  },
  {
    "code": "CF",
    "name": "Central African Republic",
    "flag": "🇨🇫",
    "slug": "central-african-republic",
    "currency": "XAF",
    "phonecode": "236",
    "isPopular": false
  },
  {
    "code": "TD",
    "name": "Chad",
    "flag": "🇹🇩",
    "slug": "chad",
    "currency": "XAF",
    "phonecode": "235",
    "isPopular": false
  },
  {
    "code": "CL",
    "name": "Chile",
    "flag": "🇨🇱",
    "slug": "chile",
    "currency": "CLP",
    "phonecode": "56",
    "isPopular": false
  },
  {
    "code": "CN",
    "name": "China",
    "flag": "🇨🇳",
    "slug": "china",
    "currency": "CNY",
    "phonecode": "86",
    "isPopular": false
  },
  {
    "code": "CX",
    "name": "Christmas Island",
    "flag": "🇨🇽",
    "slug": "christmas-island",
    "currency": "AUD",
    "phonecode": "61",
    "isPopular": false
  },
  {
    "code": "CC",
    "name": "Cocos (Keeling) Islands",
    "flag": "🇨🇨",
    "slug": "cocos-keeling-islands",
    "currency": "AUD",
    "phonecode": "61",
    "isPopular": false
  },
  {
    "code": "CO",
    "name": "Colombia",
    "flag": "🇨🇴",
    "slug": "colombia",
    "currency": "COP",
    "phonecode": "57",
    "isPopular": false
  },
  {
    "code": "KM",
    "name": "Comoros",
    "flag": "🇰🇲",
    "slug": "comoros",
    "currency": "KMF",
    "phonecode": "269",
    "isPopular": false
  },
  {
    "code": "CG",
    "name": "Congo",
    "flag": "🇨🇬",
    "slug": "congo",
    "currency": "XAF",
    "phonecode": "242",
    "isPopular": false
  },
  {
    "code": "CK",
    "name": "Cook Islands",
    "flag": "🇨🇰",
    "slug": "cook-islands",
    "currency": "NZD",
    "phonecode": "682",
    "isPopular": false
  },
  {
    "code": "CR",
    "name": "Costa Rica",
    "flag": "🇨🇷",
    "slug": "costa-rica",
    "currency": "CRC",
    "phonecode": "506",
    "isPopular": false
  },
  {
    "code": "CI",
    "name": "Cote D'Ivoire (Ivory Coast)",
    "flag": "🇨🇮",
    "slug": "cote-d-ivoire-ivory-coast",
    "currency": "XOF",
    "phonecode": "225",
    "isPopular": false
  },
  {
    "code": "HR",
    "name": "Croatia",
    "flag": "🇭🇷",
    "slug": "croatia",
    "currency": "HRK",
    "phonecode": "385",
    "isPopular": false
  },
  {
    "code": "CU",
    "name": "Cuba",
    "flag": "🇨🇺",
    "slug": "cuba",
    "currency": "CUP",
    "phonecode": "53",
    "isPopular": false
  },
  {
    "code": "CW",
    "name": "Curaçao",
    "flag": "🇨🇼",
    "slug": "cura-ao",
    "currency": "ANG",
    "phonecode": "599",
    "isPopular": false
  },
  {
    "code": "CY",
    "name": "Cyprus",
    "flag": "🇨🇾",
    "slug": "cyprus",
    "currency": "EUR",
    "phonecode": "357",
    "isPopular": false
  },
  {
    "code": "CZ",
    "name": "Czech Republic",
    "flag": "🇨🇿",
    "slug": "czech-republic",
    "currency": "CZK",
    "phonecode": "420",
    "isPopular": false
  },
  {
    "code": "CD",
    "name": "Democratic Republic of the Congo",
    "flag": "🇨🇩",
    "slug": "democratic-republic-of-the-congo",
    "currency": "CDF",
    "phonecode": "243",
    "isPopular": false
  },
  {
    "code": "DK",
    "name": "Denmark",
    "flag": "🇩🇰",
    "slug": "denmark",
    "currency": "DKK",
    "phonecode": "45",
    "isPopular": false
  },
  {
    "code": "DJ",
    "name": "Djibouti",
    "flag": "🇩🇯",
    "slug": "djibouti",
    "currency": "DJF",
    "phonecode": "253",
    "isPopular": false
  },
  {
    "code": "DM",
    "name": "Dominica",
    "flag": "🇩🇲",
    "slug": "dominica",
    "currency": "XCD",
    "phonecode": "+1-767",
    "isPopular": false
  },
  {
    "code": "DO",
    "name": "Dominican Republic",
    "flag": "🇩🇴",
    "slug": "dominican-republic",
    "currency": "DOP",
    "phonecode": "+1-809 and 1-829",
    "isPopular": false
  },
  {
    "code": "TL",
    "name": "East Timor",
    "flag": "🇹🇱",
    "slug": "east-timor",
    "currency": "USD",
    "phonecode": "670",
    "isPopular": false
  },
  {
    "code": "EC",
    "name": "Ecuador",
    "flag": "🇪🇨",
    "slug": "ecuador",
    "currency": "USD",
    "phonecode": "593",
    "isPopular": false
  },
  {
    "code": "EG",
    "name": "Egypt",
    "flag": "🇪🇬",
    "slug": "egypt",
    "currency": "EGP",
    "phonecode": "20",
    "isPopular": false
  },
  {
    "code": "SV",
    "name": "El Salvador",
    "flag": "🇸🇻",
    "slug": "el-salvador",
    "currency": "USD",
    "phonecode": "503",
    "isPopular": false
  },
  {
    "code": "GQ",
    "name": "Equatorial Guinea",
    "flag": "🇬🇶",
    "slug": "equatorial-guinea",
    "currency": "XAF",
    "phonecode": "240",
    "isPopular": false
  },
  {
    "code": "ER",
    "name": "Eritrea",
    "flag": "🇪🇷",
    "slug": "eritrea",
    "currency": "ERN",
    "phonecode": "291",
    "isPopular": false
  },
  {
    "code": "EE",
    "name": "Estonia",
    "flag": "🇪🇪",
    "slug": "estonia",
    "currency": "EUR",
    "phonecode": "372",
    "isPopular": false
  },
  {
    "code": "ET",
    "name": "Ethiopia",
    "flag": "🇪🇹",
    "slug": "ethiopia",
    "currency": "ETB",
    "phonecode": "251",
    "isPopular": false
  },
  {
    "code": "FK",
    "name": "Falkland Islands",
    "flag": "🇫🇰",
    "slug": "falkland-islands",
    "currency": "FKP",
    "phonecode": "500",
    "isPopular": false
  },
  {
    "code": "FO",
    "name": "Faroe Islands",
    "flag": "🇫🇴",
    "slug": "faroe-islands",
    "currency": "DKK",
    "phonecode": "298",
    "isPopular": false
  },
  {
    "code": "FJ",
    "name": "Fiji Islands",
    "flag": "🇫🇯",
    "slug": "fiji-islands",
    "currency": "FJD",
    "phonecode": "679",
    "isPopular": false
  },
  {
    "code": "FI",
    "name": "Finland",
    "flag": "🇫🇮",
    "slug": "finland",
    "currency": "EUR",
    "phonecode": "358",
    "isPopular": false
  },
  {
    "code": "GF",
    "name": "French Guiana",
    "flag": "🇬🇫",
    "slug": "french-guiana",
    "currency": "EUR",
    "phonecode": "594",
    "isPopular": false
  },
  {
    "code": "PF",
    "name": "French Polynesia",
    "flag": "🇵🇫",
    "slug": "french-polynesia",
    "currency": "XPF",
    "phonecode": "689",
    "isPopular": false
  },
  {
    "code": "TF",
    "name": "French Southern Territories",
    "flag": "🇹🇫",
    "slug": "french-southern-territories",
    "currency": "EUR",
    "phonecode": "262",
    "isPopular": false
  },
  {
    "code": "GA",
    "name": "Gabon",
    "flag": "🇬🇦",
    "slug": "gabon",
    "currency": "XAF",
    "phonecode": "241",
    "isPopular": false
  },
  {
    "code": "GE",
    "name": "Georgia",
    "flag": "🇬🇪",
    "slug": "georgia",
    "currency": "GEL",
    "phonecode": "995",
    "isPopular": false
  },
  {
    "code": "GH",
    "name": "Ghana",
    "flag": "🇬🇭",
    "slug": "ghana",
    "currency": "GHS",
    "phonecode": "233",
    "isPopular": false
  },
  {
    "code": "GI",
    "name": "Gibraltar",
    "flag": "🇬🇮",
    "slug": "gibraltar",
    "currency": "GIP",
    "phonecode": "350",
    "isPopular": false
  },
  {
    "code": "GR",
    "name": "Greece",
    "flag": "🇬🇷",
    "slug": "greece",
    "currency": "EUR",
    "phonecode": "30",
    "isPopular": false
  },
  {
    "code": "GL",
    "name": "Greenland",
    "flag": "🇬🇱",
    "slug": "greenland",
    "currency": "DKK",
    "phonecode": "299",
    "isPopular": false
  },
  {
    "code": "GD",
    "name": "Grenada",
    "flag": "🇬🇩",
    "slug": "grenada",
    "currency": "XCD",
    "phonecode": "+1-473",
    "isPopular": false
  },
  {
    "code": "GP",
    "name": "Guadeloupe",
    "flag": "🇬🇵",
    "slug": "guadeloupe",
    "currency": "EUR",
    "phonecode": "590",
    "isPopular": false
  },
  {
    "code": "GU",
    "name": "Guam",
    "flag": "🇬🇺",
    "slug": "guam",
    "currency": "USD",
    "phonecode": "+1-671",
    "isPopular": false
  },
  {
    "code": "GT",
    "name": "Guatemala",
    "flag": "🇬🇹",
    "slug": "guatemala",
    "currency": "GTQ",
    "phonecode": "502",
    "isPopular": false
  },
  {
    "code": "GG",
    "name": "Guernsey and Alderney",
    "flag": "🇬🇬",
    "slug": "guernsey-and-alderney",
    "currency": "GBP",
    "phonecode": "+44-1481",
    "isPopular": false
  },
  {
    "code": "GN",
    "name": "Guinea",
    "flag": "🇬🇳",
    "slug": "guinea",
    "currency": "GNF",
    "phonecode": "224",
    "isPopular": false
  },
  {
    "code": "GW",
    "name": "Guinea-Bissau",
    "flag": "🇬🇼",
    "slug": "guinea-bissau",
    "currency": "XOF",
    "phonecode": "245",
    "isPopular": false
  },
  {
    "code": "GY",
    "name": "Guyana",
    "flag": "🇬🇾",
    "slug": "guyana",
    "currency": "GYD",
    "phonecode": "592",
    "isPopular": false
  },
  {
    "code": "HT",
    "name": "Haiti",
    "flag": "🇭🇹",
    "slug": "haiti",
    "currency": "HTG",
    "phonecode": "509",
    "isPopular": false
  },
  {
    "code": "HM",
    "name": "Heard Island and McDonald Islands",
    "flag": "🇭🇲",
    "slug": "heard-island-and-mcdonald-islands",
    "currency": "AUD",
    "phonecode": "672",
    "isPopular": false
  },
  {
    "code": "HN",
    "name": "Honduras",
    "flag": "🇭🇳",
    "slug": "honduras",
    "currency": "HNL",
    "phonecode": "504",
    "isPopular": false
  },
  {
    "code": "HK",
    "name": "Hong Kong S.A.R.",
    "flag": "🇭🇰",
    "slug": "hong-kong-s-a-r",
    "currency": "HKD",
    "phonecode": "852",
    "isPopular": false
  },
  {
    "code": "HU",
    "name": "Hungary",
    "flag": "🇭🇺",
    "slug": "hungary",
    "currency": "HUF",
    "phonecode": "36",
    "isPopular": false
  },
  {
    "code": "IS",
    "name": "Iceland",
    "flag": "🇮🇸",
    "slug": "iceland",
    "currency": "ISK",
    "phonecode": "354",
    "isPopular": false
  },
  {
    "code": "ID",
    "name": "Indonesia",
    "flag": "🇮🇩",
    "slug": "indonesia",
    "currency": "IDR",
    "phonecode": "62",
    "isPopular": false
  },
  {
    "code": "IR",
    "name": "Iran",
    "flag": "🇮🇷",
    "slug": "iran",
    "currency": "IRR",
    "phonecode": "98",
    "isPopular": false
  },
  {
    "code": "IQ",
    "name": "Iraq",
    "flag": "🇮🇶",
    "slug": "iraq",
    "currency": "IQD",
    "phonecode": "964",
    "isPopular": false
  },
  {
    "code": "IE",
    "name": "Ireland",
    "flag": "🇮🇪",
    "slug": "ireland",
    "currency": "EUR",
    "phonecode": "353",
    "isPopular": false
  },
  {
    "code": "IL",
    "name": "Israel",
    "flag": "🇮🇱",
    "slug": "israel",
    "currency": "ILS",
    "phonecode": "972",
    "isPopular": false
  },
  {
    "code": "IT",
    "name": "Italy",
    "flag": "🇮🇹",
    "slug": "italy",
    "currency": "EUR",
    "phonecode": "39",
    "isPopular": false
  },
  {
    "code": "JM",
    "name": "Jamaica",
    "flag": "🇯🇲",
    "slug": "jamaica",
    "currency": "JMD",
    "phonecode": "+1-876",
    "isPopular": false
  },
  {
    "code": "JP",
    "name": "Japan",
    "flag": "🇯🇵",
    "slug": "japan",
    "currency": "JPY",
    "phonecode": "81",
    "isPopular": false
  },
  {
    "code": "JE",
    "name": "Jersey",
    "flag": "🇯🇪",
    "slug": "jersey",
    "currency": "GBP",
    "phonecode": "+44-1534",
    "isPopular": false
  },
  {
    "code": "JO",
    "name": "Jordan",
    "flag": "🇯🇴",
    "slug": "jordan",
    "currency": "JOD",
    "phonecode": "962",
    "isPopular": false
  },
  {
    "code": "KZ",
    "name": "Kazakhstan",
    "flag": "🇰🇿",
    "slug": "kazakhstan",
    "currency": "KZT",
    "phonecode": "7",
    "isPopular": false
  },
  {
    "code": "KE",
    "name": "Kenya",
    "flag": "🇰🇪",
    "slug": "kenya",
    "currency": "KES",
    "phonecode": "254",
    "isPopular": false
  },
  {
    "code": "KI",
    "name": "Kiribati",
    "flag": "🇰🇮",
    "slug": "kiribati",
    "currency": "AUD",
    "phonecode": "686",
    "isPopular": false
  },
  {
    "code": "XK",
    "name": "Kosovo",
    "flag": "🇽🇰",
    "slug": "kosovo",
    "currency": "EUR",
    "phonecode": "383",
    "isPopular": false
  },
  {
    "code": "KW",
    "name": "Kuwait",
    "flag": "🇰🇼",
    "slug": "kuwait",
    "currency": "KWD",
    "phonecode": "965",
    "isPopular": false
  },
  {
    "code": "KG",
    "name": "Kyrgyzstan",
    "flag": "🇰🇬",
    "slug": "kyrgyzstan",
    "currency": "KGS",
    "phonecode": "996",
    "isPopular": false
  },
  {
    "code": "LA",
    "name": "Laos",
    "flag": "🇱🇦",
    "slug": "laos",
    "currency": "LAK",
    "phonecode": "856",
    "isPopular": false
  },
  {
    "code": "LV",
    "name": "Latvia",
    "flag": "🇱🇻",
    "slug": "latvia",
    "currency": "EUR",
    "phonecode": "371",
    "isPopular": false
  },
  {
    "code": "LB",
    "name": "Lebanon",
    "flag": "🇱🇧",
    "slug": "lebanon",
    "currency": "LBP",
    "phonecode": "961",
    "isPopular": false
  },
  {
    "code": "LS",
    "name": "Lesotho",
    "flag": "🇱🇸",
    "slug": "lesotho",
    "currency": "LSL",
    "phonecode": "266",
    "isPopular": false
  },
  {
    "code": "LR",
    "name": "Liberia",
    "flag": "🇱🇷",
    "slug": "liberia",
    "currency": "LRD",
    "phonecode": "231",
    "isPopular": false
  },
  {
    "code": "LY",
    "name": "Libya",
    "flag": "🇱🇾",
    "slug": "libya",
    "currency": "LYD",
    "phonecode": "218",
    "isPopular": false
  },
  {
    "code": "LI",
    "name": "Liechtenstein",
    "flag": "🇱🇮",
    "slug": "liechtenstein",
    "currency": "CHF",
    "phonecode": "423",
    "isPopular": false
  },
  {
    "code": "LT",
    "name": "Lithuania",
    "flag": "🇱🇹",
    "slug": "lithuania",
    "currency": "EUR",
    "phonecode": "370",
    "isPopular": false
  },
  {
    "code": "LU",
    "name": "Luxembourg",
    "flag": "🇱🇺",
    "slug": "luxembourg",
    "currency": "EUR",
    "phonecode": "352",
    "isPopular": false
  },
  {
    "code": "MO",
    "name": "Macau S.A.R.",
    "flag": "🇲🇴",
    "slug": "macau-s-a-r",
    "currency": "MOP",
    "phonecode": "853",
    "isPopular": false
  },
  {
    "code": "MK",
    "name": "Macedonia",
    "flag": "🇲🇰",
    "slug": "macedonia",
    "currency": "MKD",
    "phonecode": "389",
    "isPopular": false
  },
  {
    "code": "MG",
    "name": "Madagascar",
    "flag": "🇲🇬",
    "slug": "madagascar",
    "currency": "MGA",
    "phonecode": "261",
    "isPopular": false
  },
  {
    "code": "MW",
    "name": "Malawi",
    "flag": "🇲🇼",
    "slug": "malawi",
    "currency": "MWK",
    "phonecode": "265",
    "isPopular": false
  },
  {
    "code": "MV",
    "name": "Maldives",
    "flag": "🇲🇻",
    "slug": "maldives",
    "currency": "MVR",
    "phonecode": "960",
    "isPopular": false
  },
  {
    "code": "ML",
    "name": "Mali",
    "flag": "🇲🇱",
    "slug": "mali",
    "currency": "XOF",
    "phonecode": "223",
    "isPopular": false
  },
  {
    "code": "MT",
    "name": "Malta",
    "flag": "🇲🇹",
    "slug": "malta",
    "currency": "EUR",
    "phonecode": "356",
    "isPopular": false
  },
  {
    "code": "IM",
    "name": "Man (Isle of)",
    "flag": "🇮🇲",
    "slug": "man-isle-of",
    "currency": "GBP",
    "phonecode": "+44-1624",
    "isPopular": false
  },
  {
    "code": "MH",
    "name": "Marshall Islands",
    "flag": "🇲🇭",
    "slug": "marshall-islands",
    "currency": "USD",
    "phonecode": "692",
    "isPopular": false
  },
  {
    "code": "MQ",
    "name": "Martinique",
    "flag": "🇲🇶",
    "slug": "martinique",
    "currency": "EUR",
    "phonecode": "596",
    "isPopular": false
  },
  {
    "code": "MR",
    "name": "Mauritania",
    "flag": "🇲🇷",
    "slug": "mauritania",
    "currency": "MRO",
    "phonecode": "222",
    "isPopular": false
  },
  {
    "code": "MU",
    "name": "Mauritius",
    "flag": "🇲🇺",
    "slug": "mauritius",
    "currency": "MUR",
    "phonecode": "230",
    "isPopular": false
  },
  {
    "code": "YT",
    "name": "Mayotte",
    "flag": "🇾🇹",
    "slug": "mayotte",
    "currency": "EUR",
    "phonecode": "262",
    "isPopular": false
  },
  {
    "code": "MX",
    "name": "Mexico",
    "flag": "🇲🇽",
    "slug": "mexico",
    "currency": "MXN",
    "phonecode": "52",
    "isPopular": false
  },
  {
    "code": "FM",
    "name": "Micronesia",
    "flag": "🇫🇲",
    "slug": "micronesia",
    "currency": "USD",
    "phonecode": "691",
    "isPopular": false
  },
  {
    "code": "MD",
    "name": "Moldova",
    "flag": "🇲🇩",
    "slug": "moldova",
    "currency": "MDL",
    "phonecode": "373",
    "isPopular": false
  },
  {
    "code": "MC",
    "name": "Monaco",
    "flag": "🇲🇨",
    "slug": "monaco",
    "currency": "EUR",
    "phonecode": "377",
    "isPopular": false
  },
  {
    "code": "MN",
    "name": "Mongolia",
    "flag": "🇲🇳",
    "slug": "mongolia",
    "currency": "MNT",
    "phonecode": "976",
    "isPopular": false
  },
  {
    "code": "ME",
    "name": "Montenegro",
    "flag": "🇲🇪",
    "slug": "montenegro",
    "currency": "EUR",
    "phonecode": "382",
    "isPopular": false
  },
  {
    "code": "MS",
    "name": "Montserrat",
    "flag": "🇲🇸",
    "slug": "montserrat",
    "currency": "XCD",
    "phonecode": "+1-664",
    "isPopular": false
  },
  {
    "code": "MA",
    "name": "Morocco",
    "flag": "🇲🇦",
    "slug": "morocco",
    "currency": "MAD",
    "phonecode": "212",
    "isPopular": false
  },
  {
    "code": "MZ",
    "name": "Mozambique",
    "flag": "🇲🇿",
    "slug": "mozambique",
    "currency": "MZN",
    "phonecode": "258",
    "isPopular": false
  },
  {
    "code": "MM",
    "name": "Myanmar",
    "flag": "🇲🇲",
    "slug": "myanmar",
    "currency": "MMK",
    "phonecode": "95",
    "isPopular": false
  },
  {
    "code": "NA",
    "name": "Namibia",
    "flag": "🇳🇦",
    "slug": "namibia",
    "currency": "NAD",
    "phonecode": "264",
    "isPopular": false
  },
  {
    "code": "NR",
    "name": "Nauru",
    "flag": "🇳🇷",
    "slug": "nauru",
    "currency": "AUD",
    "phonecode": "674",
    "isPopular": false
  },
  {
    "code": "NP",
    "name": "Nepal",
    "flag": "🇳🇵",
    "slug": "nepal",
    "currency": "NPR",
    "phonecode": "977",
    "isPopular": false
  },
  {
    "code": "NL",
    "name": "Netherlands",
    "flag": "🇳🇱",
    "slug": "netherlands",
    "currency": "EUR",
    "phonecode": "31",
    "isPopular": false
  },
  {
    "code": "NC",
    "name": "New Caledonia",
    "flag": "🇳🇨",
    "slug": "new-caledonia",
    "currency": "XPF",
    "phonecode": "687",
    "isPopular": false
  },
  {
    "code": "NI",
    "name": "Nicaragua",
    "flag": "🇳🇮",
    "slug": "nicaragua",
    "currency": "NIO",
    "phonecode": "505",
    "isPopular": false
  },
  {
    "code": "NE",
    "name": "Niger",
    "flag": "🇳🇪",
    "slug": "niger",
    "currency": "XOF",
    "phonecode": "227",
    "isPopular": false
  },
  {
    "code": "NG",
    "name": "Nigeria",
    "flag": "🇳🇬",
    "slug": "nigeria",
    "currency": "NGN",
    "phonecode": "234",
    "isPopular": false
  },
  {
    "code": "NU",
    "name": "Niue",
    "flag": "🇳🇺",
    "slug": "niue",
    "currency": "NZD",
    "phonecode": "683",
    "isPopular": false
  },
  {
    "code": "NF",
    "name": "Norfolk Island",
    "flag": "🇳🇫",
    "slug": "norfolk-island",
    "currency": "AUD",
    "phonecode": "672",
    "isPopular": false
  },
  {
    "code": "KP",
    "name": "North Korea",
    "flag": "🇰🇵",
    "slug": "north-korea",
    "currency": "KPW",
    "phonecode": "850",
    "isPopular": false
  },
  {
    "code": "MP",
    "name": "Northern Mariana Islands",
    "flag": "🇲🇵",
    "slug": "northern-mariana-islands",
    "currency": "USD",
    "phonecode": "+1-670",
    "isPopular": false
  },
  {
    "code": "NO",
    "name": "Norway",
    "flag": "🇳🇴",
    "slug": "norway",
    "currency": "NOK",
    "phonecode": "47",
    "isPopular": false
  },
  {
    "code": "OM",
    "name": "Oman",
    "flag": "🇴🇲",
    "slug": "oman",
    "currency": "OMR",
    "phonecode": "968",
    "isPopular": false
  },
  {
    "code": "PW",
    "name": "Palau",
    "flag": "🇵🇼",
    "slug": "palau",
    "currency": "USD",
    "phonecode": "680",
    "isPopular": false
  },
  {
    "code": "PS",
    "name": "Palestinian Territory Occupied",
    "flag": "🇵🇸",
    "slug": "palestinian-territory-occupied",
    "currency": "ILS",
    "phonecode": "970",
    "isPopular": false
  },
  {
    "code": "PA",
    "name": "Panama",
    "flag": "🇵🇦",
    "slug": "panama",
    "currency": "PAB",
    "phonecode": "507",
    "isPopular": false
  },
  {
    "code": "PG",
    "name": "Papua new Guinea",
    "flag": "🇵🇬",
    "slug": "papua-new-guinea",
    "currency": "PGK",
    "phonecode": "675",
    "isPopular": false
  },
  {
    "code": "PY",
    "name": "Paraguay",
    "flag": "🇵🇾",
    "slug": "paraguay",
    "currency": "PYG",
    "phonecode": "595",
    "isPopular": false
  },
  {
    "code": "PE",
    "name": "Peru",
    "flag": "🇵🇪",
    "slug": "peru",
    "currency": "PEN",
    "phonecode": "51",
    "isPopular": false
  },
  {
    "code": "PH",
    "name": "Philippines",
    "flag": "🇵🇭",
    "slug": "philippines",
    "currency": "PHP",
    "phonecode": "63",
    "isPopular": false
  },
  {
    "code": "PN",
    "name": "Pitcairn Island",
    "flag": "🇵🇳",
    "slug": "pitcairn-island",
    "currency": "NZD",
    "phonecode": "870",
    "isPopular": false
  },
  {
    "code": "PL",
    "name": "Poland",
    "flag": "🇵🇱",
    "slug": "poland",
    "currency": "PLN",
    "phonecode": "48",
    "isPopular": false
  },
  {
    "code": "PT",
    "name": "Portugal",
    "flag": "🇵🇹",
    "slug": "portugal",
    "currency": "EUR",
    "phonecode": "351",
    "isPopular": false
  },
  {
    "code": "PR",
    "name": "Puerto Rico",
    "flag": "🇵🇷",
    "slug": "puerto-rico",
    "currency": "USD",
    "phonecode": "+1-787 and 1-939",
    "isPopular": false
  },
  {
    "code": "QA",
    "name": "Qatar",
    "flag": "🇶🇦",
    "slug": "qatar",
    "currency": "QAR",
    "phonecode": "974",
    "isPopular": false
  },
  {
    "code": "RE",
    "name": "Reunion",
    "flag": "🇷🇪",
    "slug": "reunion",
    "currency": "EUR",
    "phonecode": "262",
    "isPopular": false
  },
  {
    "code": "RO",
    "name": "Romania",
    "flag": "🇷🇴",
    "slug": "romania",
    "currency": "RON",
    "phonecode": "40",
    "isPopular": false
  },
  {
    "code": "RU",
    "name": "Russia",
    "flag": "🇷🇺",
    "slug": "russia",
    "currency": "RUB",
    "phonecode": "7",
    "isPopular": false
  },
  {
    "code": "RW",
    "name": "Rwanda",
    "flag": "🇷🇼",
    "slug": "rwanda",
    "currency": "RWF",
    "phonecode": "250",
    "isPopular": false
  },
  {
    "code": "SH",
    "name": "Saint Helena",
    "flag": "🇸🇭",
    "slug": "saint-helena",
    "currency": "SHP",
    "phonecode": "290",
    "isPopular": false
  },
  {
    "code": "KN",
    "name": "Saint Kitts And Nevis",
    "flag": "🇰🇳",
    "slug": "saint-kitts-and-nevis",
    "currency": "XCD",
    "phonecode": "+1-869",
    "isPopular": false
  },
  {
    "code": "LC",
    "name": "Saint Lucia",
    "flag": "🇱🇨",
    "slug": "saint-lucia",
    "currency": "XCD",
    "phonecode": "+1-758",
    "isPopular": false
  },
  {
    "code": "PM",
    "name": "Saint Pierre and Miquelon",
    "flag": "🇵🇲",
    "slug": "saint-pierre-and-miquelon",
    "currency": "EUR",
    "phonecode": "508",
    "isPopular": false
  },
  {
    "code": "VC",
    "name": "Saint Vincent And The Grenadines",
    "flag": "🇻🇨",
    "slug": "saint-vincent-and-the-grenadines",
    "currency": "XCD",
    "phonecode": "+1-784",
    "isPopular": false
  },
  {
    "code": "BL",
    "name": "Saint-Barthelemy",
    "flag": "🇧🇱",
    "slug": "saint-barthelemy",
    "currency": "EUR",
    "phonecode": "590",
    "isPopular": false
  },
  {
    "code": "MF",
    "name": "Saint-Martin (French part)",
    "flag": "🇲🇫",
    "slug": "saint-martin-french-part",
    "currency": "EUR",
    "phonecode": "590",
    "isPopular": false
  },
  {
    "code": "WS",
    "name": "Samoa",
    "flag": "🇼🇸",
    "slug": "samoa",
    "currency": "WST",
    "phonecode": "685",
    "isPopular": false
  },
  {
    "code": "SM",
    "name": "San Marino",
    "flag": "🇸🇲",
    "slug": "san-marino",
    "currency": "EUR",
    "phonecode": "378",
    "isPopular": false
  },
  {
    "code": "ST",
    "name": "Sao Tome and Principe",
    "flag": "🇸🇹",
    "slug": "sao-tome-and-principe",
    "currency": "STD",
    "phonecode": "239",
    "isPopular": false
  },
  {
    "code": "SN",
    "name": "Senegal",
    "flag": "🇸🇳",
    "slug": "senegal",
    "currency": "XOF",
    "phonecode": "221",
    "isPopular": false
  },
  {
    "code": "RS",
    "name": "Serbia",
    "flag": "🇷🇸",
    "slug": "serbia",
    "currency": "RSD",
    "phonecode": "381",
    "isPopular": false
  },
  {
    "code": "SC",
    "name": "Seychelles",
    "flag": "🇸🇨",
    "slug": "seychelles",
    "currency": "SCR",
    "phonecode": "248",
    "isPopular": false
  },
  {
    "code": "SL",
    "name": "Sierra Leone",
    "flag": "🇸🇱",
    "slug": "sierra-leone",
    "currency": "SLL",
    "phonecode": "232",
    "isPopular": false
  },
  {
    "code": "SX",
    "name": "Sint Maarten (Dutch part)",
    "flag": "🇸🇽",
    "slug": "sint-maarten-dutch-part",
    "currency": "ANG",
    "phonecode": "1721",
    "isPopular": false
  },
  {
    "code": "SK",
    "name": "Slovakia",
    "flag": "🇸🇰",
    "slug": "slovakia",
    "currency": "EUR",
    "phonecode": "421",
    "isPopular": false
  },
  {
    "code": "SI",
    "name": "Slovenia",
    "flag": "🇸🇮",
    "slug": "slovenia",
    "currency": "EUR",
    "phonecode": "386",
    "isPopular": false
  },
  {
    "code": "SB",
    "name": "Solomon Islands",
    "flag": "🇸🇧",
    "slug": "solomon-islands",
    "currency": "SBD",
    "phonecode": "677",
    "isPopular": false
  },
  {
    "code": "SO",
    "name": "Somalia",
    "flag": "🇸🇴",
    "slug": "somalia",
    "currency": "SOS",
    "phonecode": "252",
    "isPopular": false
  },
  {
    "code": "ZA",
    "name": "South Africa",
    "flag": "🇿🇦",
    "slug": "south-africa",
    "currency": "ZAR",
    "phonecode": "27",
    "isPopular": false
  },
  {
    "code": "GS",
    "name": "South Georgia",
    "flag": "🇬🇸",
    "slug": "south-georgia",
    "currency": "GBP",
    "phonecode": "500",
    "isPopular": false
  },
  {
    "code": "KR",
    "name": "South Korea",
    "flag": "🇰🇷",
    "slug": "south-korea",
    "currency": "KRW",
    "phonecode": "82",
    "isPopular": false
  },
  {
    "code": "SS",
    "name": "South Sudan",
    "flag": "🇸🇸",
    "slug": "south-sudan",
    "currency": "SSP",
    "phonecode": "211",
    "isPopular": false
  },
  {
    "code": "ES",
    "name": "Spain",
    "flag": "🇪🇸",
    "slug": "spain",
    "currency": "EUR",
    "phonecode": "34",
    "isPopular": false
  },
  {
    "code": "LK",
    "name": "Sri Lanka",
    "flag": "🇱🇰",
    "slug": "sri-lanka",
    "currency": "LKR",
    "phonecode": "94",
    "isPopular": false
  },
  {
    "code": "SD",
    "name": "Sudan",
    "flag": "🇸🇩",
    "slug": "sudan",
    "currency": "SDG",
    "phonecode": "249",
    "isPopular": false
  },
  {
    "code": "SR",
    "name": "Suriname",
    "flag": "🇸🇷",
    "slug": "suriname",
    "currency": "SRD",
    "phonecode": "597",
    "isPopular": false
  },
  {
    "code": "SJ",
    "name": "Svalbard And Jan Mayen Islands",
    "flag": "🇸🇯",
    "slug": "svalbard-and-jan-mayen-islands",
    "currency": "NOK",
    "phonecode": "47",
    "isPopular": false
  },
  {
    "code": "SZ",
    "name": "Swaziland",
    "flag": "🇸🇿",
    "slug": "swaziland",
    "currency": "SZL",
    "phonecode": "268",
    "isPopular": false
  },
  {
    "code": "SE",
    "name": "Sweden",
    "flag": "🇸🇪",
    "slug": "sweden",
    "currency": "SEK",
    "phonecode": "46",
    "isPopular": false
  },
  {
    "code": "CH",
    "name": "Switzerland",
    "flag": "🇨🇭",
    "slug": "switzerland",
    "currency": "CHF",
    "phonecode": "41",
    "isPopular": false
  },
  {
    "code": "SY",
    "name": "Syria",
    "flag": "🇸🇾",
    "slug": "syria",
    "currency": "SYP",
    "phonecode": "963",
    "isPopular": false
  },
  {
    "code": "TW",
    "name": "Taiwan",
    "flag": "🇹🇼",
    "slug": "taiwan",
    "currency": "TWD",
    "phonecode": "886",
    "isPopular": false
  },
  {
    "code": "TJ",
    "name": "Tajikistan",
    "flag": "🇹🇯",
    "slug": "tajikistan",
    "currency": "TJS",
    "phonecode": "992",
    "isPopular": false
  },
  {
    "code": "TZ",
    "name": "Tanzania",
    "flag": "🇹🇿",
    "slug": "tanzania",
    "currency": "TZS",
    "phonecode": "255",
    "isPopular": false
  },
  {
    "code": "TH",
    "name": "Thailand",
    "flag": "🇹🇭",
    "slug": "thailand",
    "currency": "THB",
    "phonecode": "66",
    "isPopular": false
  },
  {
    "code": "BS",
    "name": "The Bahamas",
    "flag": "🇧🇸",
    "slug": "the-bahamas",
    "currency": "BSD",
    "phonecode": "+1-242",
    "isPopular": false
  },
  {
    "code": "GM",
    "name": "The Gambia",
    "flag": "🇬🇲",
    "slug": "the-gambia",
    "currency": "GMD",
    "phonecode": "220",
    "isPopular": false
  },
  {
    "code": "TG",
    "name": "Togo",
    "flag": "🇹🇬",
    "slug": "togo",
    "currency": "XOF",
    "phonecode": "228",
    "isPopular": false
  },
  {
    "code": "TK",
    "name": "Tokelau",
    "flag": "🇹🇰",
    "slug": "tokelau",
    "currency": "NZD",
    "phonecode": "690",
    "isPopular": false
  },
  {
    "code": "TO",
    "name": "Tonga",
    "flag": "🇹🇴",
    "slug": "tonga",
    "currency": "TOP",
    "phonecode": "676",
    "isPopular": false
  },
  {
    "code": "TT",
    "name": "Trinidad And Tobago",
    "flag": "🇹🇹",
    "slug": "trinidad-and-tobago",
    "currency": "TTD",
    "phonecode": "+1-868",
    "isPopular": false
  },
  {
    "code": "TN",
    "name": "Tunisia",
    "flag": "🇹🇳",
    "slug": "tunisia",
    "currency": "TND",
    "phonecode": "216",
    "isPopular": false
  },
  {
    "code": "TM",
    "name": "Turkmenistan",
    "flag": "🇹🇲",
    "slug": "turkmenistan",
    "currency": "TMT",
    "phonecode": "993",
    "isPopular": false
  },
  {
    "code": "TC",
    "name": "Turks And Caicos Islands",
    "flag": "🇹🇨",
    "slug": "turks-and-caicos-islands",
    "currency": "USD",
    "phonecode": "+1-649",
    "isPopular": false
  },
  {
    "code": "TV",
    "name": "Tuvalu",
    "flag": "🇹🇻",
    "slug": "tuvalu",
    "currency": "AUD",
    "phonecode": "688",
    "isPopular": false
  },
  {
    "code": "UG",
    "name": "Uganda",
    "flag": "🇺🇬",
    "slug": "uganda",
    "currency": "UGX",
    "phonecode": "256",
    "isPopular": false
  },
  {
    "code": "UA",
    "name": "Ukraine",
    "flag": "🇺🇦",
    "slug": "ukraine",
    "currency": "UAH",
    "phonecode": "380",
    "isPopular": false
  },
  {
    "code": "UM",
    "name": "United States Minor Outlying Islands",
    "flag": "🇺🇲",
    "slug": "united-states-minor-outlying-islands",
    "currency": "USD",
    "phonecode": "1",
    "isPopular": false
  },
  {
    "code": "UY",
    "name": "Uruguay",
    "flag": "🇺🇾",
    "slug": "uruguay",
    "currency": "UYU",
    "phonecode": "598",
    "isPopular": false
  },
  {
    "code": "UZ",
    "name": "Uzbekistan",
    "flag": "🇺🇿",
    "slug": "uzbekistan",
    "currency": "UZS",
    "phonecode": "998",
    "isPopular": false
  },
  {
    "code": "VU",
    "name": "Vanuatu",
    "flag": "🇻🇺",
    "slug": "vanuatu",
    "currency": "VUV",
    "phonecode": "678",
    "isPopular": false
  },
  {
    "code": "VA",
    "name": "Vatican City State (Holy See)",
    "flag": "🇻🇦",
    "slug": "vatican-city-state-holy-see",
    "currency": "EUR",
    "phonecode": "379",
    "isPopular": false
  },
  {
    "code": "VE",
    "name": "Venezuela",
    "flag": "🇻🇪",
    "slug": "venezuela",
    "currency": "VEF",
    "phonecode": "58",
    "isPopular": false
  },
  {
    "code": "VN",
    "name": "Vietnam",
    "flag": "🇻🇳",
    "slug": "vietnam",
    "currency": "VND",
    "phonecode": "84",
    "isPopular": false
  },
  {
    "code": "VG",
    "name": "Virgin Islands (British)",
    "flag": "🇻🇬",
    "slug": "virgin-islands-british",
    "currency": "USD",
    "phonecode": "+1-284",
    "isPopular": false
  },
  {
    "code": "VI",
    "name": "Virgin Islands (US)",
    "flag": "🇻🇮",
    "slug": "virgin-islands-us",
    "currency": "USD",
    "phonecode": "+1-340",
    "isPopular": false
  },
  {
    "code": "WF",
    "name": "Wallis And Futuna Islands",
    "flag": "🇼🇫",
    "slug": "wallis-and-futuna-islands",
    "currency": "XPF",
    "phonecode": "681",
    "isPopular": false
  },
  {
    "code": "EH",
    "name": "Western Sahara",
    "flag": "🇪🇭",
    "slug": "western-sahara",
    "currency": "MAD",
    "phonecode": "212",
    "isPopular": false
  },
  {
    "code": "YE",
    "name": "Yemen",
    "flag": "🇾🇪",
    "slug": "yemen",
    "currency": "YER",
    "phonecode": "967",
    "isPopular": false
  },
  {
    "code": "ZM",
    "name": "Zambia",
    "flag": "🇿🇲",
    "slug": "zambia",
    "currency": "ZMW",
    "phonecode": "260",
    "isPopular": false
  },
  {
    "code": "ZW",
    "name": "Zimbabwe",
    "flag": "🇿🇼",
    "slug": "zimbabwe",
    "currency": "ZWL",
    "phonecode": "263",
    "isPopular": false
  }
];

export function findGlobalCountry(codeOrSlug?: string): GlobalCountry | undefined {
  if (!codeOrSlug) return undefined;
  const normalized = codeOrSlug.trim().toUpperCase();
  const lower = codeOrSlug.trim().toLowerCase();
  return ALL_GLOBAL_COUNTRIES.find(
    (c) => c.code === normalized || c.slug === lower || c.name.toLowerCase() === lower
  );
}

export function searchGlobalCountries(query: string): GlobalCountry[] {
  if (!query || !query.trim()) return ALL_GLOBAL_COUNTRIES;
  const q = query.trim().toLowerCase();
  return ALL_GLOBAL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.slug.includes(q)
  );
}
