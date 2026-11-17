
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";


const faqStats = [
  { value: "85", label: "Questions answered" },
  { value: "11", label: "Topic categories" },
  { value: "2026", label: "Last updated" },
];

const faqCategories = [
  { id: "about", label: "About CivicIntel", count: 9 },
  { id: "research", label: "Research & Data Areas", count: 10 },
  { id: "sources", label: "Data Sources & Reliability", count: 11 },
  { id: "platform", label: "Using the Platform", count: 10 },
  { id: "publications", label: "Research & Publications", count: 7 },
  { id: "engagement", label: "Public Opinion & Engagement", count: 7 },
  { id: "partnerships", label: "Partnerships & Collaboration", count: 6 },
  { id: "access", label: "Data Access & Intellectual Property", count: 6 },
  { id: "accountability", label: "Transparency & Accountability", count: 6 },
  { id: "privacy", label: "Privacy, Security & Contact", count: 5 },
  { id: "indicators", label: "Understanding & Interpreting Data", count: 8 },
];



const faqQuestions = [
  // A. About CivicIntel
  {
    id: 1,
    category: "about",
    question: "What is CivicIntel?",
    answer: `CivicIntel is a public-interest data, research and civic-engagement initiative that makes reliable information about society, development, the economy and governance more accessible.

The platform brings together information from credible sources, organises and analyses it, and presents it in formats that help people understand important issues affecting their communities, states and countries.`,
  },
  {
    id: 2,
    category: "about",
    question: "Why was CivicIntel established?",
    answer: `CivicIntel was established to address the difficulty of accessing, understanding and using reliable civic and development information.

Although substantial amounts of data are produced by government agencies, research institutions and development organisations, the information is often scattered across different publications, databases and reports.

CivicIntel seeks to bridge this gap by bringing relevant information together, providing context and making it easier for people to use evidence in understanding societal issues and making informed decisions.`,
  },
  {
    id: 3,
    category: "about",
    question: "What is the mission of CivicIntel?",
    answer: "Our mission is to improve access to reliable, accessible and meaningful civic and development information through data, research, analysis and public engagement.",
  },
  {
    id: 4,
    category: "about",
    question: "What is the vision of CivicIntel?",
    answer: "Our vision is to become a trusted source of civic and development intelligence for Africa, supporting a more informed society and evidence-based decision-making.",
  },
  {
    id: 5,
    category: "about",
    question: "Who owns or operates CivicIntel?",
    answer: "CivicIntel is an initiative of Civic Systems Ltd, an organisation focused on public-interest data and civic engagement.",
  },
  {
    id: 6,
    category: "about",
    question: "Is CivicIntel a government agency?",
    answer: "No. CivicIntel is not a government agency or a government-owned institution. It is an independent initiative developed to improve access to civic and development information.",
  },
  {
    id: 7,
    category: "about",
    question: "Is CivicIntel a research organisation or a technology company?",
    answer: `CivicIntel combines elements of research, data intelligence, technology and civic engagement.

While technology enables us to organise, analyse and present information, our central focus is the research, interpretation and communication of information that contributes to public understanding.`,
  },
  {
    id: 8,
    category: "about",
    question: "Is CivicIntel only focused on Nigeria?",
    answer: "No. Our long-term ambition is to cover Africa. Nigeria is an important starting point for building our data resources, research capabilities and coverage, with the intention of progressively expanding to other African countries.",
  },
  {
    id: 9,
    category: "about",
    question: "What does the name CivicIntel mean?",
    answer: "CivicIntel represents the combination of civic information and intelligence. It reflects our belief that accessible, reliable information is essential to understanding society, monitoring development and strengthening public participation.",
  },

  // B. Our Research and Data Areas
  {
    id: 10,
    category: "research",
    question: "What areas does CivicIntel cover?",
    answer: `CivicIntel focuses on five broad research and data pillars:

    • Education
    • Health
    • Governance
    • Economics
    • Demographics

    Together, these areas provide a broad picture of societal conditions, institutional performance and development outcomes.`,
  },
  {
    id: 11,
    category: "research",
    question: "What type of education data does CivicIntel provide?",
    answer: `Our education research covers indicators such as:

• School enrolment and attendance.
• Out-of-school children.
• Literacy and learning outcomes.
• Primary and secondary school completion.
• WAEC, NECO and UTME performance.
• Teacher availability and distribution.
• School infrastructure and facilities.
• Education budgets and expenditure.
• Access to education across states and communities.

Our objective is to provide information that helps users understand access, quality, equity and performance within the education sector.`,
  },
  {
    id: 12,
    category: "research",
    question: "What type of health data does CivicIntel provide?",
    answer: `Our health research covers areas including:

• Maternal and child health.
• Immunisation coverage.
• Zero-dose children.
• Disease prevalence and burden.
• HIV/AIDS prevalence and treatment coverage.
• Healthcare facilities and infrastructure.
• Health workforce distribution.
• Public health expenditure.
• Access to essential healthcare services.

These indicators help users understand healthcare access, public health challenges and progress across different locations.`,
  },
  {
    id: 13,
    category: "research",
    question: "What type of governance data does CivicIntel provide?",
    answer: `Our governance research examines government performance, public institutions, accountability and the delivery of public services.

This may include:

• State internally generated revenue (IGR).
• Government budgets and expenditure.
• Budget implementation.
• Public debt.
• Public procurement and fiscal transparency.
• Government revenue and expenditure trends.
• Public service delivery.
• Institutional performance.
• Selected governance and accountability indicators.`,
  },
  {
    id: 14,
    category: "research",
    question: "What type of economic data does CivicIntel provide?",
    answer: `Our economic research examines the conditions and trends influencing economic activity and the welfare of individuals and households.

This includes:

• Inflation and consumer prices.
• Poverty and inequality.
• Employment and unemployment.
• Household income and expenditure.
• Cost of living.
• Economic growth.
• Productivity.
• Business and commercial activity.
• Microeconomic and macroeconomic indicators.`,
  },
  {
    id: 15,
    category: "research",
    question: "What type of demographic data does CivicIntel provide?",
    answer: `Demographic research helps explain the characteristics, distribution and changing structure of populations.

Our coverage may include:

• Population size and growth.
• Age and gender distribution.
• Population density.
• Migration and urbanisation.
• Household characteristics.
• Birth and mortality indicators.
• Population distribution across states and local government areas.`,
  },
  {
    id: 16,
    category: "research",
    question: "Does CivicIntel provide state-by-state data?",
    answer: "Yes. Where reliable and sufficiently comparable information is available, we organise and present data across Nigerian states and other relevant geographical units. This allows users to compare development indicators, identify disparities and understand differences in outcomes across locations.",
  },
  {
    id: 17,
    category: "research",
    question: "Does CivicIntel provide local government-level data?",
    answer: "We aim to provide information at the lowest geographical level supported by credible source data. However, not all indicators are available at local government level. Where information is only available at national or state level, we clearly indicate the geographical coverage rather than implying a more detailed level of accuracy.",
  },
  {
    id: 18,
    category: "research",
    question: "Does CivicIntel cover historical data?",
    answer: "Yes. Historical data is important for understanding trends and measuring progress over time. Where available, CivicIntel seeks to provide historical datasets that allow users to examine changes across years, identify patterns and compare development outcomes.",
  },
  {
    id: 19,
    category: "research",
    question: "Does CivicIntel cover all African countries?",
    answer: "Not yet. Our coverage will expand progressively as we source, validate and organise relevant information for additional countries. The availability of information will depend on the reliability, accessibility and consistency of the underlying sources.",
  },

  // C. Data Sources, Quality and Reliability
  {
    id: 20,
    category: "sources",
    question: "Where does CivicIntel get its data?",
    answer: `CivicIntel sources information from credible and identifiable institutions, including:

• National and state government agencies.
• National statistical institutions.
• Ministries, departments and agencies.
• International development organisations.
• Multilateral institutions.
• Research institutions and academic publications.
• Recognised surveys and official administrative databases.

Examples of relevant sources include the National Bureau of Statistics (NBS), National Population Commission (NPC), Federal Ministry of Education, Federal Ministry of Health, Universal Basic Education Commission (UBEC), World Bank, UNICEF and the World Health Organization (WHO).`,
  },
  {
    id: 21,
    category: "sources",
    question: "Does CivicIntel generate its own data?",
    answer: `CivicIntel uses a combination of existing data and original research.

A significant part of our work involves identifying, collecting, validating, organising and analysing information already produced by credible institutions.

Where we conduct original surveys, polls or primary research, we identify such work accordingly and provide relevant methodological information.`,
  },
  {
    id: 22,
    category: "sources",
    question: "How does CivicIntel ensure that its data is reliable?",
    answer: `We prioritise data quality through source identification, documentation, verification and consistency checks.

Our approach considers:

• The credibility of the original source.
• The year and period covered by the data.
• The methodology used to collect the information.
• The geographical coverage.
• Consistency between reported figures and supporting documentation.
• Any limitations or qualifications provided by the original source.

Where necessary, we retain links or references to the original publications to support independent verification.`,
  },
  {
    id: 23,
    category: "sources",
    question: "Can users trust the information published on CivicIntel?",
    answer: `We are committed to publishing information that is traceable, properly documented and presented with appropriate context.

However, data quality depends partly on the quality of the original information supplied by its producers. We therefore make efforts to identify source limitations, methodological differences and other factors that may affect interpretation.

We encourage users to consult the original source documentation where additional detail is required.`,
  },
  {
    id: 24,
    category: "sources",
    question: "Does CivicIntel independently verify every statistic?",
    answer: `Our approach involves assessing available source documentation and checking information for consistency and plausibility.

However, verification does not necessarily mean independently repeating the original survey, census or administrative exercise.

Where CivicIntel has not independently collected or audited primary data, we identify the original source rather than suggesting otherwise.`,
  },
  {
    id: 25,
    category: "sources",
    question: "What happens when two sources report different figures for the same indicator?",
    answer: `Differences may arise from variations in methodology, reporting periods, definitions, geographical coverage or data collection processes.

Where conflicting figures are identified, we examine their sources and methodological differences. Where appropriate, we present the figures with explanations rather than arbitrarily selecting one or combining incompatible statistics.`,
  },
  {
    id: 26,
    category: "sources",
    question: "Does CivicIntel update its data regularly?",
    answer: `Yes. We aim to update datasets and research outputs as new information becomes available and is assessed for inclusion.

Update frequency varies depending on the indicator and the publication schedule of the original data provider. Some datasets may be updated annually, while others may follow periodic surveys or less frequent reporting cycles.`,
  },
  {
    id: 27,
    category: "sources",
    question: "Why might some datasets have missing values?",
    answer: `Missing values may occur because an institution has not published the information, the data was not collected, or the available publication does not cover every geographical area or reporting period.

We do not treat missing information as zero. Where possible, we identify unavailable observations and explain their limitations.`,
  },
  {
    id: 28,
    category: "sources",
    question: "Does CivicIntel alter figures obtained from original sources?",
    answer: `We do not arbitrarily change reported statistics.

Where data processing, standardisation, aggregation or calculations are required, the process should be documented so users can understand how the published figures were obtained.`,
  },
  {
    id: 29,
    category: "sources",
    question: "How does CivicIntel distinguish between estimates and actual figures?",
    answer: `We aim to clearly distinguish estimates, projections, survey findings, administrative records and officially reported statistics.

This distinction is important because each type of data has different characteristics and limitations. Users should be able to identify the nature of the information they are viewing.`,
  },
  {
    id: 30,
    category: "sources",
    question: "Does CivicIntel endorse the institutions whose data it publishes?",
    answer: `No. Referencing or publishing data from an institution does not constitute an endorsement of that institution, its policies or its activities.

Our focus is on the information itself, its relevance and its contribution to public understanding.`,
  },

  // D. Using the CivicIntel Platform
  {
    id: 31,
    category: "platform",
    question: "Who can use CivicIntel?",
    answer: `CivicIntel is intended for a broad audience, including:

• Members of the public.
• Students and researchers.
• Journalists and media organisations.
• Policymakers and government institutions.
• Civil society organisations.
• NGOs and development partners.
• Think tanks and academic institutions.
• Businesses and private-sector organisations.`,
  },
  {
    id: 32,
    category: "platform",
    question: "Do I need to be a researcher to use CivicIntel?",
    answer: `No. CivicIntel is designed to make information accessible to both technical and non-technical users.

Whether you are a student researching an issue, a journalist investigating a development trend or a citizen trying to understand your state's performance, you should be able to find information presented in an understandable format.`,
  },
  {
    id: 33,
    category: "platform",
    question: "How do I find information on a particular topic?",
    answer: `You can explore the platform through its research areas, datasets, publications and available visualisations.

Depending on the platform's available features, you may also be able to search for specific indicators, locations, years or subjects.`,
  },
  {
    id: 34,
    category: "platform",
    question: "Can I compare different states on CivicIntel?",
    answer: `Yes. Where comparable data is available, users can examine differences between states using tables, charts, maps and other visual formats.

Comparisons should always consider the reporting period, definitions and methodology behind the indicators.`,
  },
  {
    id: 35,
    category: "platform",
    question: "Can I compare data across different years?",
    answer: `Yes. Where historical observations are available and sufficiently consistent, CivicIntel supports comparisons over time.

This helps users identify trends, assess changes and understand whether an indicator is improving, declining or remaining relatively stable.`,
  },
  {
    id: 36,
    category: "platform",
    question: "What are CivicIntel dashboards?",
    answer: `Dashboards are visual presentations of selected indicators designed to make information easier to explore and interpret.

They may combine charts, tables, maps and summary statistics to provide an overview of a particular subject, location or development issue.`,
  },
  {
    id: 37,
    category: "platform",
    question: "What are data visualisations?",
    answer: `Data visualisations are graphical representations of information, including charts, graphs, maps and diagrams.

They help users identify patterns, compare figures and understand complex information more easily.`,
  },
  {
    id: 38,
    category: "platform",
    question: "Can I download datasets from CivicIntel?",
    answer: `Where download functionality is available, users may access datasets in supported formats for research, analysis and other permitted uses.

Each dataset should retain its source information, reporting period and relevant methodological notes.`,
  },
  {
    id: 39,
    category: "platform",
    question: "Can I download research reports and publications?",
    answer: `Where provided, publications may be viewed or downloaded directly from the platform.

Availability may differ depending on the publication and its applicable access or licensing conditions.`,
  },
  {
    id: 40,
    category: "platform",
    question: "Can I use CivicIntel without creating an account?",
    answer: `Access requirements depend on the particular features of the platform. Publicly accessible information should be available without unnecessary barriers, while features requiring registration may have separate access conditions.`,
  },

  {
    id: 41,
    category: "publications",
    question: "Does CivicIntel publish original research?",
    answer: `Yes. In addition to organising existing data, CivicIntel intends to produce original research, analytical reports, policy briefs and publications that examine important development and societal issues.`,
  },
  {
    id: 42,
    category: "publications",
    question: "What is the difference between a dataset and a research report?",
    answer: `A dataset is an organised collection of information that users can examine, analyse and reuse.

A research report goes further by examining information, explaining findings, identifying patterns and presenting conclusions or recommendations.`,
  },
  {
    id: 43,
    category: "publications",
    question: "Does CivicIntel publish policy briefs?",
    answer: `Yes. Policy briefs are among the research outputs CivicIntel may produce.

They are designed to communicate important findings and policy implications in a concise format, particularly for policymakers, institutions and development stakeholders.`,
  },
  {
    id: 44,
    category: "publications",
    question: "Can CivicIntel explain what a particular statistic means?",
    answer: `Yes. One of our objectives is to make data understandable.

Beyond presenting figures, CivicIntel seeks to provide explanations, context and analysis that help users understand the significance of the information.`,
  },
  {
    id: 45,
    category: "publications",
    question: "Does CivicIntel provide recommendations based on its research?",
    answer: `Where appropriate, our research may identify policy implications, development gaps and possible areas for intervention.

Any recommendations should be supported by the available evidence and clearly distinguished from the underlying statistical findings.`,
  },
  {
    id: 46,
    category: "publications",
    question: "Can I cite CivicIntel in my academic research or publication?",
    answer: `Yes. You may reference CivicIntel publications and datasets, subject to their applicable usage and citation requirements.

We encourage users to include the original data source where CivicIntel has republished or analysed information produced by another institution.`,
  },
  {
    id: 47,
    category: "publications",
    question: "How should I reference a CivicIntel dataset?",
    answer: `We recommend including the dataset title, CivicIntel as the platform through which it was accessed, the original data source, the reporting year and the date accessed.

Where available, users should also reference the dataset's permanent link or publication identifier.`,
  },
  {
    id: 48,
    category: "engagement",
    question: "Does CivicIntel conduct public opinion polls?",
    answer: `CivicIntel intends to use polls and surveys as part of its civic-engagement and research activities.

These activities help capture public perceptions, experiences and opinions on issues affecting society.`,
  },
  {
    id: 49,
    category: "engagement",
    question: "What is the purpose of CivicIntel opinion polls?",
    answer: `Our polls are intended to provide insight into how people perceive important social, economic and governance issues.

They can help stimulate public discussion, identify areas of concern and complement other forms of research and evidence.`,
  },
  {
    id: 50,
    category: "engagement",
    question: "Are CivicIntel online polls representative of the entire population?",
    answer: `Not necessarily.

An open online poll may reflect the views of people who voluntarily participate, rather than a statistically representative sample of the wider population.

Unless a poll uses an appropriate sampling design and methodology, its results should not be interpreted as representing the views of an entire state or country.`,
  },
  {
    id: 51,
    category: "engagement",
    question: "How does CivicIntel conduct surveys?",
    answer: `Survey methods may vary depending on the research objective.

They may include structured questionnaires, interviews, online surveys, field-based data collection and other recognised research approaches.

Where a survey is published, relevant methodological details should be provided, including the target population, sample size, geographical coverage, data collection period and limitations.`,
  },
  {
    id: 52,
    category: "engagement",
    question: "Can I participate in CivicIntel polls and surveys?",
    answer: `Yes. Where public polls and surveys are available, interested individuals can participate in accordance with the participation requirements provided.`,
  },
  {
    id: 53,
    category: "engagement",
    question: "Are poll results influenced by political interests?",
    answer: `CivicIntel is committed to evidence-based research and transparent presentation of findings.

Polls and surveys should be designed and reported using clearly documented methods.

Participation and findings should not be manipulated to promote a predetermined political position.`,
  },
  {
    id: 54,
    category: "engagement",
    question: "Can organisations commission surveys or research through CivicIntel?",
    answer: `Organisations interested in research collaboration or commissioned studies may contact CivicIntel to discuss their objectives, requirements and the feasibility of the proposed work.`,
  },
  {
    id: 55,
    category: "partnerships",
    question: "Can government institutions partner with CivicIntel?",
    answer: `Yes. CivicIntel welcomes opportunities to engage with government institutions on data accessibility, research, development monitoring and evidence-based policy discussions.`,
  },
  {
    id: 56,
    category: "partnerships",
    question: "Can NGOs and development organisations work with CivicIntel?",
    answer: `Yes. We recognise the importance of collaboration with organisations working in education, health, governance, economic development and other public-interest areas.

Potential areas of collaboration include research, data collection, analysis, development monitoring and knowledge sharing.`,
  },
  {
    id: 57,
    category: "partnerships",
    question: "Can universities and research institutions collaborate with CivicIntel?",
    answer: `Yes. Academic and research institutions are important partners in advancing credible research and improving the availability and quality of development information.

We welcome opportunities for joint research, data exchange, publications and knowledge development.`,
  },
  {
    id: 58,
    category: "partnerships",
    question: "Can organisations contribute data to CivicIntel?",
    answer: `Yes. Organisations with relevant datasets, publications or research findings may contact us to explore opportunities to contribute information to the platform.

All proposed contributions are subject to appropriate source assessment, documentation and quality review.`,
  },
  {
    id: 59,
    category: "partnerships",
    question: "Can CivicIntel collaborate with international organisations?",
    answer: `Yes. Our ambition to become a trusted source of civic and development intelligence across Africa creates opportunities for collaboration with international institutions, multilateral organisations, research networks and development partners.`,
  },
  {
    id: 60,
    category: "partnerships",
    question: "How can my organisation become a CivicIntel partner?",
    answer: `Interested organisations can contact CivicIntel with a brief introduction, their area of interest and the nature of the proposed collaboration.

Our team can then assess the opportunity and determine the most appropriate engagement approach.`,
  },

  {
    id: 61,
    category: "access",
    question: "Is the information on CivicIntel free?",
    answer: `CivicIntel is committed to improving public access to civic and development information.

The accessibility of individual datasets, publications and services may vary depending on their source, licensing conditions and the applicable platform access arrangements.`,
  },
  {
    id: 62,
    category: "access",
    question: "Can I reuse information published on CivicIntel?",
    answer: `Reuse is subject to the applicable copyright, licensing and attribution conditions.

Where information originates from third-party institutions, users must also respect the original source's terms of use.`,
  },
  {
    id: 63,
    category: "access",
    question: "Can I reproduce CivicIntel charts and visualisations in my publication?",
    answer: `Users should follow the applicable attribution and reuse requirements.

We encourage users to acknowledge CivicIntel and the underlying data source when reproducing or referencing our visualisations.`,
  },
  {
    id: 64,
    category: "access",
    question: "Can I use CivicIntel data for commercial purposes?",
    answer: `Commercial use may be subject to additional restrictions, particularly where third-party data or licensed materials are involved.

Users should review the applicable terms or contact CivicIntel for clarification before using materials commercially.`,
  },
  {
    id: 65,
    category: "access",
    question: "Does CivicIntel own all the data published on the platform?",
    answer: `No. CivicIntel may publish, organise, analyse or visualise information produced by other institutions.

Ownership and intellectual property rights remain subject to the terms governing the original materials. CivicIntel's original research, analytical outputs and platform materials are subject to their respective ownership and licensing conditions.`,
  },
  {
    id: 66,
    category: "access",
    question: "Can I request a customised dataset?",
    answer: `Users and institutions with specific data requirements may contact CivicIntel to discuss the availability of relevant information and the possibility of preparing a customised dataset or analysis.`,
  },
  {
    id: 67,
    category: "accountability",
    question: "What should I do if I notice an error on CivicIntel?",
    answer: `We welcome feedback from users who identify possible inaccuracies, inconsistencies or missing information.

Please contact us with the relevant page or dataset, the issue identified and any supporting documentation that may help us investigate.`,
  },
  {
    id: 68,
    category: "accountability",
    question: "Does CivicIntel correct published errors?",
    answer: `Yes. Where an error is confirmed, we aim to correct the affected information and, where appropriate, provide an explanation of the correction.`,
  },
  {
    id: 69,
    category: "accountability",
    question: "Can I challenge a finding or interpretation published by CivicIntel?",
    answer: `Yes. We welcome evidence-based feedback, alternative interpretations and constructive criticism.

Our commitment is to ensure that research and analytical outputs remain open to scrutiny and informed discussion.`,
  },
  {
    id: 70,
    category: "accountability",
    question: "Does CivicIntel have a political affiliation?",
    answer: `CivicIntel's purpose is to support public understanding through data, research and evidence.

Our research and publications should be guided by verifiable information, transparent methodology and impartial analysis rather than political allegiance.`,
  },
  {
    id: 71,
    category: "accountability",
    question: "Does CivicIntel take positions on government policies?",
    answer: `Our primary responsibility is to provide information, research and analysis that help people understand public issues.

Where our research identifies policy implications or development gaps, we may communicate these findings and provide evidence-based recommendations. Such analysis should not be confused with political endorsement.`,
  },
  {
    id: 72,
    category: "accountability",
    question: "How does CivicIntel protect the integrity of its research?",
    answer: `We promote responsible data handling, transparent sourcing, methodological documentation and appropriate separation between evidence and interpretation.

We believe that credibility is built through consistency, openness and accountability.`,
  },
  {
    id: 73,
    category: "privacy",
    question: "Does CivicIntel collect personal information from visitors?",
    answer: `The collection of personal information depends on the features and services a visitor uses, such as contact forms, registrations, surveys or subscriptions.

Any personal information collected should be handled in accordance with CivicIntel's applicable privacy policy and relevant data protection requirements.`,
  },
  {
    id: 74,
    category: "privacy",
    question: "How does CivicIntel protect information submitted through surveys?",
    answer: `Information submitted through surveys should be handled according to the relevant survey's privacy and consent arrangements.

Where research involves personal information, appropriate safeguards should be applied to its collection, storage, processing and reporting.`,
  },
  {
    id: 75,
    category: "privacy",
    question: "Does CivicIntel share users' personal information with third parties?",
    answer: `Personal information should only be processed or shared in accordance with the applicable privacy policy, consent arrangements and legal requirements.

Please consult our Privacy Policy for further details.`,
  },
  {
    id: 76,
    category: "privacy",
    question: "How can I contact CivicIntel?",
    answer: `You can contact CivicIntel through the official contact channels published on our website.

For research enquiries, data contributions, corrections, partnerships and institutional collaborations, please indicate the nature of your enquiry so it can be directed appropriately.`,
  },
  {
    id: 77,
    category: "privacy",
    question: "How can I stay informed about CivicIntel's latest research and publications?",
    answer: `You can follow our official communication channels and subscribe to available updates to receive information about new datasets, publications, research findings and other platform developments.`,
  },
  {
    id: 78,
    category: "indicators",
    question: "What is an indicator?",
    answer: `An indicator is a measurable variable used to assess a particular condition, outcome or trend.

For example, school enrolment rates, unemployment rates, maternal mortality ratios and internally generated revenue are indicators that help explain different aspects of societal development.`,
  },
  {
    id: 79,
    category: "indicators",
    question: "What is the difference between a percentage and a percentage-point change?",
    answer: `A percentage describes a proportion relative to a whole, while a percentage-point change measures the arithmetic difference between two percentages.

For example, if a state's school enrolment rate increases from 60% to 70%, the increase is 10 percentage points, or approximately 16.7% relative growth.`,
  },
  {
    id: 80,
    category: "indicators",
    question: "Why do some indicators use different reporting years?",
    answer: `Different institutions collect and publish information according to different schedules.

For example, population estimates may be updated annually, while some education or health indicators may only be available through surveys conducted every three or five years.

We identify the reporting period of available information to help users interpret it correctly.`,
  },
  {
    id: 81,
    category: "indicators",
    question: "Can two indicators measuring the same subject produce different results?",
    answer: `Yes. Different indicators may measure different dimensions of the same subject.

For example, school attendance, school enrolment and school completion are related but distinct measurements. Similarly, poverty estimates may differ depending on the methodology and poverty threshold used.

Users should therefore examine the definitions and methodologies behind each indicator before comparing results.`,
  },
  {
    id: 82,
    category: "indicators",
    question: "What does it mean when data is unavailable for a particular state or year?",
    answer: `It means that CivicIntel does not currently have sufficiently documented information for that particular observation.

It does not necessarily mean that the activity or condition being measured does not exist.`,
  },
  {
    id: 83,
    category: "indicators",
    question: "Does a higher value always mean better performance?",
    answer: `No. The interpretation depends on the indicator.

For example, a higher literacy rate generally represents a positive outcome, whereas a higher maternal mortality rate indicates a serious public health challenge.

CivicIntel seeks to provide the appropriate context when presenting indicators.`,
  },
  {
    id: 84,
    category: "indicators",
    question: "Can CivicIntel data be used to rank Nigerian states?",
    answer: `Where comparable indicators and sufficiently reliable data are available, users may examine relative performance across states.

However, rankings should be interpreted carefully. A ranking based on one indicator does not necessarily represent the overall development performance of a state.`,
  },
  {
    id: 85,
    category: "indicators",
    question: "How should I interpret a trend that shows improvement or decline?",
    answer: `A trend should be interpreted in the context of the indicator, reporting period, methodology and wider circumstances.

An increase may indicate improvement for one indicator and deterioration for another. We encourage users to examine the underlying figures and accompanying explanations rather than relying solely on visual trends.`,
  },
];


function FAQ() {
    const [activeCategory, setActiveCategory] = useState("about");
    const [openQuestion, setOpenQuestion] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

   const categoryQuestions = faqQuestions.filter(
    (item) => item.category === activeCategory
);

const filteredQuestions = categoryQuestions.filter((item) =>
    `${item.question} ${item.answer}`
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
);
  return (
    <main className="min-h-screen bg-[#F7F8F7]">
      {/* FAQ Header */}
      <section className="bg-[#F7F8F7] px-5 py-12 sm:px-8 lg:py-16 mt-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_320px]">

          {/* Heading */}
          <div>
            <div className="mb-5 flex items-center gap-2 text-xs text-gray-500">
              <Link to="/" className="transition hover:text-[#1F7A3F]">
                Home
              </Link>
              <span>/</span>
              <span className="font-medium text-[#0B3C5D]">
                Frequently Asked Questions
              </span>
            </div>

            <span className="inline-block rounded-full bg-[#DDF1E4] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#1F7A3F]">
              FAQ Library
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#0B3C5D] sm:text-4xl">
              Frequently Asked{" "}
              <span className="text-[#1F7A3F]">Questions</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">
              Clear answers to common questions about CivicIntel, our research, data, publications and how to use the platform.
            </p>
          </div>

          {/* Statistics Card */}
          <div className="rounded-2xl bg-linear-to-br from-[#1F7A3F] to-[#0B3C5D] p-6 text-white shadow-lg">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              FAQ Library
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {faqStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-[9px] leading-4 text-white/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-white/10 p-3">
              <p className="text-xs font-semibold">
                Find the answers you need.
              </p>
              <p className="mt-1 text-[10px] leading-5 text-white/70">
                Explore verified information about CivicIntel.
              </p>
            </div>
          </div>

        </div>
      </section>

      <section className="bg-[#D8E7EF] px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[250px_1fr]">

            {/* Category Sidebar */}
            <aside className="h-fit rounded-2xl border border-white/70 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-[#0B3C5D]">
                Browse by topic
            </h2>

            <div className="space-y-2">
                {faqCategories.map((category) => (
                <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                    setActiveCategory(category.id);
                    setOpenQuestion(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-xs transition ${
                    activeCategory === category.id
                        ? "bg-[#1F7A3F] font-semibold text-white"
                        : "text-gray-600 hover:bg-[#EAF2ED] hover:text-[#1F7A3F]"
                    }`}
                >
                    <span>{category.label}</span>

                    <span
                    className={`rounded-full px-2 py-1 text-[10px] ${
                        activeCategory === category.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    >
                    {category.count}
                    </span>
                </button>
                ))}
            </div>
            </aside>

            {/* FAQ Questions */}
            <div className="space-y-6">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {searchTerm.trim()
                        ? `${filteredQuestions.length} ${
                            filteredQuestions.length === 1
                                ? "question"
                                : "questions"
                            } found`
                        : `Showing ${filteredQuestions.length} questions`}
                    </p>
                </div>
                <div className="relative">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search frequently asked questions..."
                        className="w-full rounded-xl border border-white bg-white px-5 py-4 text-sm text-[#0B3C5D] shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#1F7A3F] focus:ring-2 focus:ring-[#1F7A3F]/10"
                    />
                </div>
                
                {filteredQuestions.length === 0 ? (
                    <div className="rounded-xl border border-white bg-white px-6 py-12 text-center shadow-sm">
                        <h2 className="text-sm font-bold text-[#0B3C5D]">
                            No questions found
                        </h2>
                        <p className="mt-2 text-xs text-gray-500">
                            Try another keyword or choose a different topic.
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2 className="mb-4 text-sm font-bold text-[#0B3C5D]">
                            {faqCategories.find(
                                (category) => category.id === activeCategory
                            )?.label}
                        </h2>

                        <div className="space-y-3">
                            {filteredQuestions.map((item) => (
                                <div
                                    key={item.id}
                                    className="overflow-hidden rounded-xl border border-white/70 bg-white shadow-sm"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenQuestion(
                                                openQuestion === item.id ? null : item.id
                                            )
                                        }
                                        aria-expanded={openQuestion === item.id}
                                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                    >
                                        <span className="text-sm font-semibold text-[#0B3C5D]">
                                            {item.question}
                                        </span>

                                        <ChevronDown
                                            size={18}
                                            className={`shrink-0 text-[#1F7A3F] transition-transform ${
                                                openQuestion === item.id ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    {openQuestion === item.id && (
                                        <div className="border-t border-gray-100 px-5 py-4">
                                            <p className="text-xs leading-7 text-gray-600 whitespace-pre-line">
                                                {item.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        </section>

        <section className="bg-[#F7F8F7] px-5 py-14 sm:px-8">
            <div className="mx-auto max-w-5xl rounded-2xl bg-linear-to-br from-[#0B3C5D] to-[#1F7A3F] px-6 py-10 text-center text-white shadow-lg sm:px-12">
                <h2 className="text-xl font-bold sm:text-2xl">
                Still have questions?
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/75">
                Couldn't find the information you were looking for?
                Visit our contact page and we'll be glad to hear from you.
                </p>

                <a
                    href="mailto:contact@civicintelafrica.com"
                    className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 text-xs font-bold text-[#0B3C5D] transition hover:bg-[#EAF2ED]"
                    >
                    Contact Us
                </a>
            </div>
        </section>
    </main>
  );
}

export default FAQ;
