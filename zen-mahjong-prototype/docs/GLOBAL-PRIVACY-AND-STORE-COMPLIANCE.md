# Global Privacy and Store Publishing Compliance

**Product:** Zen Mahjong Prototype  
**Document version:** 1.0  
**Applies to:** iOS and Android global distribution  
**Last reviewed:** 2026-10-02  
**Status:** Proposed launch baseline; legal approval required before production release

## 1. Purpose and legal boundary

This document defines the minimum privacy, data-governance, consumer-protection, advertising, child-safety, security, and app-store controls required before Zen Mahjong is released globally. It covers Offline Play, future Account Play, optional rewarded advertising, progression, purchases, analytics, and support operations.

There is no single "global app law," and no static document can guarantee compliance with every national, state, provincial, or local rule. Laws, regulator guidance, sanctions, tax rules, and store policies change continuously. The country register in Appendix A ensures that every sovereign country is considered, but it is not a substitute for advice from qualified counsel in the countries where the app will be offered. A country must not be enabled merely because Apple or Google makes a storefront available there.

This document is an engineering and release-governance baseline, not legal advice. Before production launch, counsel must approve the privacy notice, terms, age strategy, advertising model, purchase model, data transfers, retention schedule, and every enabled country group.

## 2. Product compliance posture

### 2.1 Offline Play

- Offline Play must work without an account and without a network connection.
- Game state, settings, achievements, and progress remain on the device unless the player explicitly chooses an export or account migration feature.
- Local data must be erasable from an in-app **Reset Offline Data** action. Uninstall behavior must be explained accurately because operating systems may retain backups.
- Offline Play must not silently initialize advertising, analytics, fingerprinting, attribution, or remote-config SDKs.
- A network failure must never block independent Offline Play.

### 2.2 Account Play

- Account Play is optional and must explain what synchronization changes before account creation.
- The server is authoritative for account progression, scarce rewards, purchases, remote events, and anti-abuse decisions.
- The player must be able to access core Offline Play without creating an account unless a future feature inherently requires an account.
- Account creation requires an in-app deletion path. Google Play additionally requires an accessible web deletion-request resource.
- Account deletion must remove the account and associated personal data unless retention is required for law, fraud prevention, disputes, security, or financial records.

### 2.3 Data that may be processed

The initial data model should be limited to:

| Category | Examples | Default purpose | Default location |
| --- | --- | --- | --- |
| Local gameplay | board state, moves, progress, achievements, settings | provide Offline Play | device only |
| Account identity | internal ID, email or identity-provider subject | authentication and recovery | server |
| Account gameplay | synchronized progress, rewards, event participation | Account Play | server and device cache |
| Purchase records | product ID, receipt/token, entitlement, refund status | fulfilment, reconciliation, fraud prevention | server and store provider |
| Security records | login attempts, command IDs, abuse signals, audit events | integrity and security | server |
| Support records | messages, attachments voluntarily submitted, resolution | customer support | support system |
| Consent records | notice version, choice, time, region, withdrawal | prove and honour user choice | server or consent platform |
| Diagnostics | crash traces, app/device/OS version, performance metrics | reliability | disabled until approved and disclosed |

Do not collect precise location, contacts, photos, microphone data, health data, biometrics, government identifiers, or advertising identifiers unless a separately approved feature genuinely requires them. Device fingerprinting and shadow profiles are prohibited.

## 3. Worldwide minimum standard

The app must apply the following controls everywhere, even where local law is less specific:

1. **Purpose limitation:** collect data only for a named, documented purpose.
2. **Data minimization:** collect the smallest amount needed for that purpose.
3. **Lawful processing:** record the applicable lawful basis or valid consent for each server-side purpose.
4. **Transparency:** publish plain-language privacy information before or at collection.
5. **User control:** support access, correction, deletion, export, objection, and consent withdrawal where applicable.
6. **Storage limitation:** retain identifiable data only for an approved period.
7. **Security:** protect data in transit and at rest, limit access, audit privileged actions, and test incident response.
8. **Processor accountability:** review SDKs and vendors, sign required agreements, and prohibit unapproved secondary use.
9. **Cross-border accountability:** document data locations and lawful transfer mechanisms.
10. **Privacy by design:** assess each new SDK, permission, identifier, account feature, ad feature, and server endpoint before release.
11. **Child protection:** use age-appropriate defaults and never rely on a store age rating as proof of legal age.
12. **Accuracy:** store disclosures, consent screens, privacy notices, and actual runtime behavior must agree.

These principles align with the [OECD Privacy Guidelines](https://www.oecd.org/en/publications/oecd-guidelines-on-the-protection-of-privacy-and-transborder-flows-of-personal-data_9789264196391-en.html), [Convention 108/108+](https://www.coe.int/en/web/data-protection/convention108-and-protocol), and the [UNCTAD privacy legislation tracker](https://unctad.org/page/data-protection-and-privacy-legislation-worldwide).

## 4. Privacy notice requirements

The published privacy notice must identify:

- the legal entity responsible for the app and reliable contact details;
- categories of data collected by the app, server, SDKs, stores, and support tools;
- purposes and lawful bases, including any legitimate-interest assessment;
- recipients and processor categories;
- countries or regions where data is stored or accessed;
- transfer safeguards;
- retention periods or objective criteria;
- user rights and how to exercise them;
- account and Offline Play deletion behavior;
- child and age restrictions;
- advertising, tracking, analytics, and profiling behavior;
- automated decisions that materially affect users, if any;
- complaint and regulator contact routes where required;
- effective date, version history, and material-change notification process.

The notice must be available from the store listing, account creation, settings, and the public website. Translations must be professionally reviewed for every supported language; machine translation alone is not sufficient for legal text.

## 5. Consent and lawful-basis rules

- Consent must be specific, informed, freely given, unambiguous, and as easy to withdraw as to grant.
- Do not bundle optional advertising or analytics consent with game access.
- Do not use pre-selected boxes, deceptive button hierarchy, forced consent, or consent walls for nonessential processing.
- Record the notice version, choices, region, timestamp, and withdrawal event.
- Obtain tracking permission through Apple's App Tracking Transparency framework before tracking across apps or websites.
- In the EEA/UK and other consent jurisdictions, obtain the required consent before accessing nonessential device storage or enabling personalized advertising/measurement.
- If processing relies on contract or legitimate interests, document why that basis applies. Do not label every operation "necessary for contract."

See the European Commission's [consent guidance](https://commission.europa.eu/law/law-topic/data-protection/reform/rights-citizens/how-my-personal-data-protected/how-should-my-consent-be-requested_en.html) and Apple's [App Tracking Transparency documentation](https://developer.apple.com/documentation/AppTrackingTransparency).

## 6. Retention and deletion baseline

The following periods are product proposals. Counsel may require shorter or longer periods by country or record type.

| Data | Proposed retention | Deletion behavior |
| --- | --- | --- |
| Offline gameplay | until reset, uninstall, or OS backup expiry | erase through Reset Offline Data |
| Active account identity and progress | while account is active | delete or irreversibly anonymize after verified request |
| Inactive account | 24 months after last activity, following notice | delete/anonymize unless user returns or law requires retention |
| Deleted live account data | within 30 days | remove from production systems |
| Backups containing deleted data | maximum 90 days | expire by rotation; do not restore into live use |
| Security and abuse logs | 180 days | delete or aggregate unless attached to an active investigation |
| Support records | 24 months after closure | remove attachments earlier when no longer needed |
| Consent records | duration needed to demonstrate compliance | retain minimal proof, not unrelated profile data |
| Purchase, refund, and tax records | statutory period, commonly up to 7 years | restrict access and retain only legally required fields |

Deletion must propagate to processors. The deletion workflow must distinguish: account closure, deletion of associated personal data, cancellation of subscriptions through the store, loss of cloud progress, and data retained under a legal exception. Never claim immediate deletion when backup or statutory retention applies.

Apple requires in-app initiation of account deletion when account creation is offered; see [Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/). Google requires an in-app path and a public web resource; see [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

## 7. User-rights procedure

1. Accept requests in-app and through a published privacy contact or web form.
2. Log the request without collecting unnecessary identity evidence.
3. Verify identity proportionately; never request government ID by default.
4. Search every system and processor using the internal account identifier.
5. Fulfil access, correction, portability, objection, restriction, or deletion as applicable.
6. Reply within the shortest applicable legal period; use 30 calendar days as the operational default.
7. Explain lawful refusals, retained records, appeal routes, and regulator complaint rights.
8. Preserve an auditable minimal record of completion.

Offline-only users need a local reset path because the operator may have no server record to locate. UK-specific erasure and retention guidance is available from the ICO: [right to erasure](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/) and [storage limitation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/).

## 8. Children and age assurance

The target audience must be a documented product decision based on the app's actual themes, artwork, marketing, store listing, and expected users. An "18+" statement cannot be used to avoid child laws when the experience is directed to children.

Before launch, choose and approve one of these models:

- **General audience, not child-directed:** avoid knowingly collecting child data; use a neutral age screen only if legally necessary; do not profile likely minors.
- **Mixed audience:** apply age assurance appropriate to risk, separate adult and minor experiences, obtain verifiable parental consent where required, and default minors to the most private settings.
- **Child-directed:** complete a separate child-safety program, parental notice/consent, limited collection, child-appropriate terms, certified ad technology, and enhanced review.

Important thresholds differ. COPPA generally concerns children under 13 in the United States; India's Digital Personal Data Protection Act defines a child as under 18. Other countries use different ages for consent or impose age-appropriate design duties. The strictest applicable rule must be used for an affected player.

No personalized or interest-based advertising may be shown to children or users of unknown age where prohibited. For Google Play child audiences, use only permitted self-certified ad SDK versions and comply with the [Families policy](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en) and [target-audience requirements](https://support.google.com/googleplay/android-developer/answer/9867159/manage-target-audience-and-app-content-settings?hl=en-GB). Review the FTC's [mobile app and COPPA guidance](https://www.ftc.gov/business-guidance/resources/marketing-your-mobile-app-get-it-right-start) and India's [Digital Personal Data Protection Act, 2023](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf).

## 9. Advertising, rewards, and monetization

Rewarded ads and purchases remain disabled until this section has an approved implementation record.

- Inventory every ad/attribution SDK, its sub-processors, identifiers, data destinations, and child-rating eligibility.
- Default to contextual/non-personalized advertising until regional consent and age controls are proven.
- Do not initialize optional ad or attribution SDKs before required consent.
- Show the reward, duration, limits, and failure behavior before a player chooses an ad.
- Grant a server-authoritative reward exactly once in Account Play using idempotent verification.
- Never condition an already-earned reward on consent to personalized ads.
- Do not use deceptive close controls, disguised ads, forced clicks, or ads that interrupt active tile selection.
- Do not represent a random reward as guaranteed. Disclose probabilities where randomized paid items are permitted and required.
- Do not allow cash-out, wagering, stake-based prizes, or transferable value without a separate gambling/legal review.
- Use Apple In-App Purchase and Google Play Billing for in-app digital goods where store rules require them.
- Clearly display price, currency, renewal, cancellation, eligibility, and restoration terms.

Apple's payment and login requirements are maintained in the [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/). Store policy, gambling law, loot-box rules, consumer law, and tax treatment must all be checked separately for each enabled market.

## 10. Security and incident response

- Use TLS for all network traffic and platform-provided encrypted storage for sensitive local secrets.
- Store authentication tokens in Keychain/Keystore, never in ordinary MMKV documents.
- Hash passwords with a modern adaptive algorithm if passwords are ever owned by the service; prefer established identity providers.
- Apply least privilege, multi-factor authentication, role separation, secret rotation, dependency scanning, and audited production access.
- Validate all server commands, receipts, reward claims, identifiers, and replay/idempotency keys.
- Encrypt sensitive server data and backups; test restoration and deletion behavior.
- Maintain a data-flow map, software/SDK inventory, vulnerability process, incident runbook, and processor contact list.
- Do not log tokens, email addresses, full IP histories, ad identifiers, payment details, or gameplay payloads unless specifically justified.
- Test account takeover, replay, tampering, offline/online conflict, deletion, restore, and authorization boundaries before release.

An incident response must identify affected data and countries, contain the issue, preserve evidence, assess risk, notify processors and insurers, and meet the shortest applicable regulator/user notification deadline. GDPR can require regulator notification within 72 hours after awareness when the legal threshold is met; other jurisdictions have different clocks. Counsel must make the notification decision.

## 11. International transfers and hosting

Before Account Play is enabled:

- map every country where data is collected, stored, backed up, supported, or remotely accessed;
- identify the controller, processors, sub-processors, and their contractual roles;
- select an approved primary hosting region and disaster-recovery region;
- execute data-processing agreements and required transfer clauses;
- complete transfer impact assessments where required;
- document adequacy decisions, standard contractual clauses, certifications, localization, or government approvals used;
- provide a process for sub-processor changes and objections;
- prevent a vendor from moving data to an unapproved region.

China's PIPL, data-localization/security-assessment rules, India's phased DPDP framework, Saudi Arabia's PDPL, and other transfer regimes require country-specific review. Relevant official sources include China's [Personal Information Protection Law](https://en.spp.gov.cn/2021-12/29/c_948419.htm), India's [DPDP Rules, 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf), and Saudi Arabia's [SDAIA regulations and policies](https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx).

## 12. Regional legal matrix

This matrix identifies principal privacy regimes and release concerns. It is not exhaustive; national telecom, advertising, tax, consumer, accessibility, gaming, sanctions, cyber-security, and localization laws may also apply.

| Market | Principal baseline | Required release attention |
| --- | --- | --- |
| EEA | GDPR, ePrivacy national laws, consumer law, DSA where applicable | lawful basis, consent, DPIA, transfers, rights, minor protection, trader disclosures |
| United Kingdom | UK GDPR, Data Protection Act, PECR, consumer law, age-appropriate design | consent/storage access, child design, UK representative where required, rights and retention |
| Switzerland | revised FADP | transparency, security, processor/transfer controls, breach assessment |
| United States | federal sector laws, FTC Act/COPPA, state privacy and consumer laws | state-by-state applicability, sale/share/targeted-ad opt-outs, sensitive data, universal opt-out signals, child rules |
| Canada | PIPEDA plus provincial laws | meaningful consent, safeguards, access, breach records/notice, Quebec and provincial review |
| Brazil | LGPD and consumer law | legal basis, DPO/contact, rights, security incidents, international transfers, children |
| Mexico | 2025 private-sector personal-data law and consumer rules | privacy notice, consent, ARCO rights, transfers, security |
| Latin America and Caribbean | national privacy, consumer, child, telecom, and tax rules | country counsel; Spanish/Portuguese/local-language notices; transfer and registration checks |
| India | DPDP Act 2023 and phased DPDP Rules 2025, consumer and gaming rules | notice/consent, under-18 child standard, grievance path, erasure, processor and transfer controls |
| China | PIPL, Cybersecurity Law, Data Security Law, games/content and publishing controls | local entity/licensing assessment, consent, localization/transfer, SDK review, local distribution requirements |
| Japan | APPI | purpose notice, security, third-party provision, cross-border disclosures, rights |
| South Korea | PIPA and game/consumer rules | consent detail, overseas transfers, deletion, minors, local representative assessment |
| Singapore | PDPA | consent/notification, purpose limitation, access/correction, retention, transfer limitation, DPO |
| Australia | Privacy Act and Australian Privacy Principles, consumer law | collection necessity, notices, overseas disclosure, breach response, children reform watch |
| New Zealand | Privacy Act 2020 | privacy officer, collection notice, access/correction, overseas disclosures, breach notice |
| Indonesia | Personal Data Protection Law | legal basis/consent, rights, controller duties, transfers, breach notice |
| Thailand | PDPA | lawful basis, notices, rights, DPO/DPIA where required, transfers |
| Philippines | Data Privacy Act and implementing rules | registration/DPO/security assessment where applicable, rights, breach process |
| Middle East | country PDPLs, cyber, content, consumer, tax, and localization rules | country-by-country review; Arabic notices where required; transfer and local-representative checks |
| Africa | country privacy, cyber, consumer, child, and tax laws | POPIA for South Africa plus country-by-country regulator and registration review |
| Turkey | KVKK and consumer rules | consent/legal basis, registry/representative assessment, transfers, Turkish notices |
| Russia/Belarus and sanctioned markets | localization, content, security, sanctions/export controls | legal, sanctions, payment, hosting, encryption, and distribution approval before enablement |

Official regional references:

- European Commission: [data protection and privacy](https://commission.europa.eu/digital-life/protecting-your-data-and-privacy_en.html) and [Digital Services Act summary](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=legissum%3A4625430)
- California Attorney General: [California Consumer Privacy Act](https://oag.ca.gov/privacy/ccpa)
- Canada OPC: [PIPEDA overview](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda_brief?wbdisable=true)
- Brazil: [LGPD official text](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)
- Mexico: [Federal personal-data law for private parties](https://www.ordenjuridico.gob.mx/Documentos/Federal/html/wo125102.html)
- Australia: [Privacy Act 1988](https://www.legislation.gov.au/Latest/C2022C00361)
- New Zealand: [Privacy Act and principles](https://www.privacy.org.nz/privacy-act-2020/privacy-principles/)
- Japan: [APPI official English translation](https://www.ppc.go.jp/files/pdf/APPI_english.pdf)
- South Korea: [PIPC laws and regulations](https://pipc.go.kr/eng/user/lgp/law/lawsRegulations.do)
- Singapore: [PDPA data-protection obligations](https://www.pdpc.gov.sg/overview-of-pdpa/the-legislation/personal-data-protection-act/data-protection-obligations)
- Indonesia: [Personal Data Protection Law](https://peraturan.go.id/id/uu-no-27-tahun-2022)
- Thailand: [PDPA official resource](https://www.etda.or.th/th/Useful-Resource/law/pdpa.aspx)
- Philippines: [Data Privacy Act](https://privacy.gov.ph/data-privacy-act-/)
- South Africa: [POPIA](https://www.pic.gov.za/protection-personal-information-act)
- Switzerland: [Federal data-protection framework](https://www.bj.admin.ch/en/data-protection)
- Turkey: [Personal Data Protection Law](https://www.kvkk.gov.tr/Icerik/6649/Personal-Data-Protection-Law)
- United Arab Emirates: [data-protection laws](https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws)

## 13. Apple App Store release checklist

- [ ] Active Apple Developer organization account, verified legal entity, agreements, tax, and banking details.
- [ ] Correct bundle ID, app name, category, age rating, countries, encryption/export answers, and support contact.
- [ ] Public privacy-policy URL and support URL work without authentication.
- [ ] App Privacy answers exactly match app, backend, SDK, advertising, and support behavior.
- [ ] `PrivacyInfo.xcprivacy` manifests exist for the app and applicable SDKs, with valid required-reason API declarations.
- [ ] ATT prompt appears before tracking and only when tracking is actually requested.
- [ ] Account deletion is available inside the app when account creation exists.
- [ ] Sign in with Apple or an equivalent qualifying login option is offered when required by third-party login rules.
- [ ] Digital features, currency, levels, and subscriptions use In-App Purchase where required.
- [ ] Restore purchases, subscription terms, refund handling, and family-sharing behavior are tested.
- [ ] Review account/demo mode and instructions are supplied; production review services remain available.
- [ ] Permissions have user-facing purpose strings and are requested only in context.
- [ ] Accessibility, reduced motion, localization, screenshots, metadata, and claims are verified on supported devices.
- [ ] No private APIs, misleading UI, copied assets, unlicensed music, or unsupported health/wellness claims.

Primary references: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [App submission guidance](https://developer.apple.com/app-store/submitting/), [privacy manifests](https://developer.apple.com/documentation/BundleResources/privacy-manifest-files), and [required-reason APIs](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api).

## 14. Google Play release checklist

- [ ] Verified organization developer account, payments profile, public developer details, and role-based access.
- [ ] Correct application ID, signing/App Signing configuration, target API level, supported devices, and country availability.
- [ ] Privacy-policy URL is public, stable, accurate, and also available in the app.
- [ ] Data safety form exactly matches runtime collection, sharing, security, retention, and SDK behavior.
- [ ] Account deletion is available in-app and through the declared public web resource.
- [ ] Target audience, content rating, ads declaration, news/health/financial declarations if applicable, and app-access instructions are complete.
- [ ] Families requirements are satisfied if children are included in the target audience.
- [ ] Google Play Billing is used for in-app digital goods where required.
- [ ] Permissions and APIs are necessary, declared, and supported by required Play Console forms.
- [ ] Every SDK is policy-compatible, maintained, and reflected in Data safety answers.
- [ ] Store listing, screenshots, claims, pricing, subscriptions, and promotional content are accurate and localized.
- [ ] Closed/open testing and current personal-account production-access requirements are completed where applicable.
- [ ] Android vitals, crashes, ANRs, security, accessibility, backups, deletion, and upgrade paths pass release gates.

Primary references: [Google Play Developer Policy Center](https://play.google.com/about/developer-content-policy/), [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en), [Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en), and [account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

## 15. Country activation gate

Every country enabled in App Store Connect or Play Console requires a dated row in a maintained launch register with:

| Required field | Approval evidence |
| --- | --- |
| Country and storefront availability | store-console screenshot or official availability source |
| Privacy and child-law review | counsel name, date, memo/version |
| Consumer, advertising, gaming, and reward review | approved product behavior and required disclosures |
| Data-transfer/localization review | hosting map and transfer mechanism |
| Sanctions/export/encryption review | compliance approval |
| Tax, merchant, invoicing, and currency review | finance approval |
| Required language and local contacts | approved localized notice/support path |
| Content and cultural review | age rating, symbols, quotations, music, artwork, local restrictions |
| Store metadata review | final listing and declarations |
| Release owner | named approver and activation date |

**Release rule:** missing evidence means the country remains disabled. Countries may be launched in approved cohorts rather than all at once.

## 16. Engineering release evidence

The release record must contain:

- versioned data inventory and architecture/data-flow diagram;
- SDK and sub-processor inventory with versions and purpose;
- privacy-impact assessment and child-risk assessment;
- consent and age-flow screenshots for each applicable region;
- privacy notice, terms, deletion page, and localization versions;
- store privacy/Data safety answer exports;
- deletion, export, consent withdrawal, account migration, and offline-reset test results;
- security test report, dependency report, incident exercise, and backup-restore test;
- country launch register and approval evidence;
- Apple and Google submission checklists signed by release owner.

Any material change to data collection, SDKs, ads, purchases, accounts, hosting, age targeting, or countries reopens the relevant review.

## 17. Decisions still required for Zen Mahjong

1. What legal entity will publish the app and act as data controller?
2. Which country will be the first operating establishment, and where will support be provided?
3. Is the actual target audience adults only, general audience, mixed audience, or children?
4. Will Account Play use email/password, magic link, Apple, Google, or another identity provider?
5. Which analytics, crash reporting, attribution, advertising, support, and consent vendors are proposed?
6. Will rewarded ads exist, and are they contextual only or personalized with valid consent?
7. Will the app sell currency, assists, subscriptions, randomized items, or paid levels?
8. Can rewards ever be transferred, traded, converted, or redeemed outside the app?
9. Which server/database provider and data regions will be used?
10. Can Offline Play progress be imported into Account Play, and what data is uploaded?
11. What exact inactivity and statutory retention periods will counsel approve?
12. Which launch cohort will be enabled first, and who owns country-by-country legal approval?
13. Which languages will receive human-reviewed legal and store localization?
14. What public URLs will host the privacy notice, terms, support, and deletion request?
15. Who serves as privacy contact, security incident owner, and escalation counsel?

Resolving these questions completes the product-specific answer to `OPEN-QUESTIONS.md` question 25. The country register and legal approval remain recurring release obligations, not a one-time answer.

## Appendix A: Worldwide country consideration register

The following list covers the 193 UN member states plus the Holy See and the State of Palestine. Inclusion means **considered**, not approved or necessarily available through Apple or Google. Each must pass Section 15 before activation.

### Africa

Algeria; Angola; Benin; Botswana; Burkina Faso; Burundi; Cabo Verde; Cameroon; Central African Republic; Chad; Comoros; Democratic Republic of the Congo; Republic of the Congo; Cote d'Ivoire; Djibouti; Egypt; Equatorial Guinea; Eritrea; Eswatini; Ethiopia; Gabon; Gambia; Ghana; Guinea; Guinea-Bissau; Kenya; Lesotho; Liberia; Libya; Madagascar; Malawi; Mali; Mauritania; Mauritius; Morocco; Mozambique; Namibia; Niger; Nigeria; Rwanda; Sao Tome and Principe; Senegal; Seychelles; Sierra Leone; Somalia; South Africa; South Sudan; Sudan; Tanzania; Togo; Tunisia; Uganda; Zambia; Zimbabwe.

### Americas

Antigua and Barbuda; Argentina; Bahamas; Barbados; Belize; Bolivia; Brazil; Canada; Chile; Colombia; Costa Rica; Cuba; Dominica; Dominican Republic; Ecuador; El Salvador; Grenada; Guatemala; Guyana; Haiti; Honduras; Jamaica; Mexico; Nicaragua; Panama; Paraguay; Peru; Saint Kitts and Nevis; Saint Lucia; Saint Vincent and the Grenadines; Suriname; Trinidad and Tobago; United States; Uruguay; Venezuela.

### Asia

Afghanistan; Armenia; Azerbaijan; Bahrain; Bangladesh; Bhutan; Brunei; Cambodia; China; Cyprus; Georgia; India; Indonesia; Iran; Iraq; Israel; Japan; Jordan; Kazakhstan; Kuwait; Kyrgyzstan; Laos; Lebanon; Malaysia; Maldives; Mongolia; Myanmar; Nepal; North Korea; Oman; Pakistan; Philippines; Qatar; Saudi Arabia; Singapore; South Korea; Sri Lanka; State of Palestine; Syria; Tajikistan; Thailand; Timor-Leste; Turkey; Turkmenistan; United Arab Emirates; Uzbekistan; Vietnam; Yemen.

### Europe

Albania; Andorra; Austria; Belarus; Belgium; Bosnia and Herzegovina; Bulgaria; Croatia; Czechia; Denmark; Estonia; Finland; France; Germany; Greece; Holy See; Hungary; Iceland; Ireland; Italy; Latvia; Liechtenstein; Lithuania; Luxembourg; Malta; Moldova; Monaco; Montenegro; Netherlands; North Macedonia; Norway; Poland; Portugal; Romania; Russia; San Marino; Serbia; Slovakia; Slovenia; Spain; Sweden; Switzerland; Ukraine; United Kingdom.

### Oceania

Australia; Fiji; Kiribati; Marshall Islands; Micronesia; Nauru; New Zealand; Palau; Papua New Guinea; Samoa; Solomon Islands; Tonga; Tuvalu; Vanuatu.

Dependencies, overseas territories, special administrative regions, and disputed territories must be added as separate rows whenever a store treats them as distinct storefronts or their laws differ. Examples include Hong Kong, Macao, Taiwan, Puerto Rico, Guam, the US Virgin Islands, Greenland, Faroe Islands, Gibraltar, Isle of Man, Jersey, Guernsey, Bermuda, Cayman Islands, and other territories.

## Appendix B: Review cadence

- **Before each release:** compare runtime behavior, SDK versions, permissions, server endpoints, store declarations, and notices.
- **Quarterly:** review store policies, sub-processors, country availability, complaints, rights metrics, and legal developments.
- **Annually:** complete legal, child-safety, security, retention, transfer, accessibility, tax, and sanctions review.
- **Immediately:** review after a breach, regulator inquiry, new monetization model, new child audience, new SDK, new data category, new hosting region, or entry into a new country.

