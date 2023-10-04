export const from = 'Kol Tzedek <admin@kol-tzedek.org>'

export const bcc = ''

export const getSubject = ({english_name_deceased}) => `You have an upcoming yahrzeit for ${english_name_deceased}`

export const getTextBody = ({first_name, relationship, english_name_deceased, yahr_in_selected_cal, g_date_of_passing, sunset_preposition, hd_date_of_passing, calendar, g_yahr_date}) => `
Dear ${first_name},

The yahrzeit for your ${relationship}, ${english_name_deceased}, is coming up on ${yahr_in_selected_cal}. They passed away on the Gregorian date ${g_date_of_passing}${sunset_preposition}, which corresponded to the Hebrew date of ${hd_date_of_passing}.

As you chose to observe on the ${calendar} date, this year's observance of the yahrzeit begins at sundown on the evening before ${g_yahr_date}, when it is traditional to light a yahrzeit candle that will burn for 24 hours and recite the Mourner's Kaddish.

Kol Tzedek has a yahrzeit kit available for members. It has a yahrzeit candle and a zine with the Mourner's Kaddish and suggestions for meaningful Jewish practices to observe the yahrzeit. Please call 267-702-6187 or email me to arrange to pick one up from the office.

The names of those we are remembering are read aloud before Mourner's Kaddish during Shabbat services immediately following the yahrzeit. If you would like to be present to say Kaddish, but cannot be at that service, contact the office to request the name be read on another Shabbat.

As a community, we are memory keepers. On this yahrzeit, we invite you to sponsor oneg (https://www.kol-tzedek.org/oneg.html) or make a donation to our memorial fund in their memory (https://www.kol-tzedek.org/donate.html).

May their memory be a blessing in your life.

L'Shalom,
Josh Bloom, Operations Manager
Rabbi Ari Lev Fornari, Rabbi Mónica Gomery, & Rabbi Michelle Greenfield
`

export const getHtmlBody = ({first_name, relationship, english_name_deceased, yahr_in_selected_cal, g_date_of_passing, sunset_preposition, hd_date_of_passing, calendar, g_yahr_date}) => `<div style="max-width:800px">
<p><img src="cid:thisistheyahrzeitbanner" style="width:100%;height:auto" />
</p>
<p>Dear ${first_name},</p>
<p><strong>The yahrzeit for your ${relationship}, ${english_name_deceased}, is coming up on ${yahr_in_selected_cal}.</strong> They passed away on the Gregorian date ${g_date_of_passing}${sunset_preposition}, which corresponded to the Hebrew date of ${hd_date_of_passing}.</p>
<p><strong>As you chose to observe on the ${calendar} date, this year&rsquo;s observance of the yahrzeit begins at sundown on the evening before ${g_yahr_date}, </strong>when it is traditional to light a yahrzeit candle that will burn for 24 hours and recite the Mourner&rsquo;s Kaddish.</p>
<p><strong>Kol Tzedek has a yahrzeit kit available for members.</strong> It has a yahrzeit candle and a zine with the Mourner&rsquo;s Kaddish and suggestions for meaningful Jewish practices to observe the yahrzeit. Please call 267-702-6187 or email me to arrange to pick one up from the office.</p>
<p><strong>The names of those we are remembering are read aloud before Mourner&rsquo;s Kaddish during Shabbat services immediately following the yahrzeit.</strong> If you would like to be present to say Kaddish, but cannot be at that service, contact the office to request the name be read on another Shabbat.</p>
<p>As a community, we are memory keepers. <strong>On this yahrzeit, we invite you to <a href="https://www.kol-tzedek.org/oneg.html">sponsor oneg</a> or <a href="https://www.kol-tzedek.org/donate.html">make a donation to our memorial fund</a> in their memory.</strong></p>
<p>May their memory be a blessing in your life.</p>
<p>L&rsquo;Shalom,<br>
Josh Bloom, <em>Operations Manager</em><br>
Rabbi Ari Lev Fornari, Rabbi M&oacute;nica Gomery, &amp; Rabbi Michelle Greenfield</p>
</div>
`
