import { Stack, Box, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import Faq from "@/app/components/Faq";
import PageHero, { Section, Card, Grid } from "@/app/components/pages/PageHero";
import {
  SITE_URL, BUSINESS, KEYWORDS, JsonLd, breadcrumbSchema, faqSchema,
} from "@/util/site";

export const metadata = {
  title: "Firework Safety — Storing, Lighting and First Aid",
  description:
    "Practical safety guidance for using fireworks at home: how to store them, how to light them, what never to do, and what to do about a burn.",
  keywords: [...KEYWORDS, "cracker safety rules India", "firework safety for children", "Diwali safety"],
  alternates: { canonical: `${SITE_URL}/safety` },
  openGraph: {
    title: "Firework Safety Guide",
    description: "How to store, light and dispose of fireworks — and what to do if something goes wrong.",
    url: `${SITE_URL}/safety`, siteName: BUSINESS.name, type: "website",
  },
};

const DO = [
  ["Light in the open", "An open yard, a terrace or a street with room overhead. Nothing under a balcony, a tree, an awning or overhead cables."],
  ["One at a time", "Light a single item, step well back, and wait for it to finish before touching anything else. Most injuries happen to somebody holding the next one."],
  ["Keep water to hand", "A filled bucket and a running tap nearby. It puts out a spill, and it is where a burn goes first."],
  ["An adult on every child", "Not an adult supervising the group — one adult watching one child. Sparklers reach a temperature that will mark skin instantly."],
  ["Store cool, dry and shut", "A closed box, away from the kitchen, the water heater, sunlight and any flame. Never in a bedroom or on the way out of the house."],
  ["Tie hair back, wear cotton", "Cotton smoulders. Synthetics melt onto skin, which turns a small burn into a serious one. Shoes, not sandals."],
];

const DONT = [
  ["Never relight a dud", "If it does not go, leave it alone for at least half an hour, then soak it in water. Going back to it is the single most common way people lose fingers."],
  ["Never hold one in your hand", "Not to light it, not to throw it. Fuse timings vary between items and between batches."],
  ["Never in a pocket", "Friction and body heat are enough. Carry them in the box they came in."],
  ["Never in glass or metal", "Nothing that turns a firework into shrapnel — no bottles, tins or pipes as launchers."],
  ["Never near fuel or livestock", "Away from vehicles, cylinders, generators and stored fuel. Keep animals indoors; the noise distresses them badly."],
  ["Never modify anything", "Do not open, combine, extend a fuse or make your own. The mixture is not stable outside its casing."],
];

const FAQS = [
  {
    q: "What should I do about a burn?",
    a: "Hold it under cool running water for at least 10 to 20 minutes — longer than feels necessary. Do not use ice, butter, oil, toothpaste or any ointment. Cover loosely with a clean, non-fluffy cloth or cling film. Anything blistered, larger than a palm, or on a face, hand or joint should be seen by a doctor the same day. An eye injury goes to hospital immediately, without rubbing or rinsing.",
  },
  {
    q: "Are there rules about when fireworks can be set off?",
    a: "Yes. The Supreme Court has restricted bursting to a two-hour window on Diwali night, generally 8pm to 10pm, with separate windows for other festivals, and only permitted types may be sold or used. Local authorities can tighten this further, and the position changes from year to year — check what applies in your district before the day.",
  },
  {
    q: "What are green crackers?",
    a: "Formulations developed by CSIR-NEERI that cut particulate and gaseous emissions relative to conventional ones, usually by removing barium and reducing the amount of oxidiser. They are less polluting, not harmless: every precaution on this page still applies.",
  },
  {
    q: "How should leftovers be stored until next year?",
    a: "Better not to. Fireworks absorb moisture over a year in an Indian monsoon, and damp stock behaves unpredictably — sometimes failing, sometimes delaying. Buy what you will use, and soak anything left over before disposal.",
  },
  {
    q: "How do I dispose of used or unused fireworks?",
    a: "Soak them in a bucket of water overnight, then bag them and put them out with household waste. Never burn the debris, and never put unsoaked items in a bin — a smouldering remnant is enough to start a fire.",
  },
  {
    q: "Which items are safest with young children?",
    a: "Ground-based, low-noise items — flower pots, ground chakkars and fountains — watched at a distance, with an adult lighting every one. Sparklers look harmless and are not: they burn at hundreds of degrees and are a common cause of hand burns in small children.",
  },
];

function Rule({ text, body, bad }) {
  return (
    <Stack direction="row" gap={1.5} alignItems="flex-start">
      <Box
        sx={{
          display: "grid", placeItems: "center", flexShrink: 0, mt: 0.25,
          width: 22, height: 22, borderRadius: "50%",
          backgroundColor: bad ? "var(--danger-soft)" : "var(--success-soft)",
          color: bad ? "var(--danger-ink)" : "var(--success-ink)",
          "& svg": { fontSize: 15 },
        }}
      >
        {bad ? <CloseRoundedIcon /> : <CheckRoundedIcon />}
      </Box>
      <Stack gap={0.35} minWidth={0}>
        <Typography fontSize={14.5} fontWeight={800} color="var(--text-color)">{text}</Typography>
        <Typography fontSize={13.5} lineHeight={1.7} color="var(--text-color-secondary)">{body}</Typography>
      </Stack>
    </Stack>
  );
}

export default function SafetyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Shop", path: "/" }, { name: "Safety", path: "/safety" }])} />
      <JsonLd data={faqSchema(FAQS)} />

      <PageHero
        eyebrow="Safety"
        title="Fireworks are explosives. Treated as such, they are fine."
        lead="Almost every Diwali injury comes from a handful of avoidable things: going back to a dud, holding one, or letting a child hold a sparkler unwatched. Five minutes here is worth more than any amount of care on the night."
      />

      <Section title="Do">
        <Grid cols={2} gap={2.5}>
          {DO.map(([t, b]) => <Rule key={t} text={t} body={b} />)}
        </Grid>
      </Section>

      <Section tint title="Never">
        <Grid cols={2} gap={2.5}>
          {DONT.map(([t, b]) => <Rule key={t} text={t} body={b} bad />)}
        </Grid>
      </Section>

      <Section>
        <Grid cols={2}>
          <Card accent>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ color: "var(--danger)", display: "flex" }}><MedicalServicesRoundedIcon /></Box>
              <Typography fontSize={16.5} fontWeight={800} color="var(--text-color)">If someone is burned</Typography>
            </Stack>
            <Typography fontSize={13.5} lineHeight={1.8} color="var(--text-color-secondary)">
              Cool running water, 10–20 minutes, straight away. No ice, no butter, no
              oil, no toothpaste, no ointment. Cover loosely with clean cloth or cling
              film. Blistering, anything larger than a palm, or any burn to a face,
              hand or joint — see a doctor the same day. Eyes go to hospital at once:
              do not rub, do not rinse.
            </Typography>
          </Card>
          <Card>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ color: "var(--secondary-color)", display: "flex" }}><LocalFireDepartmentRoundedIcon /></Box>
              <Typography fontSize={16.5} fontWeight={800} color="var(--text-color)">If one does not go off</Typography>
            </Stack>
            <Typography fontSize={13.5} lineHeight={1.8} color="var(--text-color-secondary)">
              Leave it. Do not approach it for at least thirty minutes — a smouldering
              fuse can sit unseen and then catch. After that, pour water over it from
              a distance, soak it thoroughly, and bin it wet. Never relight, never
              open, never take it apart to see why.
            </Typography>
          </Card>
        </Grid>
      </Section>

      <Section tint>
        <Faq heading="Safety questions" faqs={FAQS} />
        <Typography fontSize={12} color="var(--text-color-trinary)" sx={{ mt: 1 }}>
          General guidance, not medical or legal advice. Follow the instructions printed
          on each pack, and check the rules in force in your district before the day.
        </Typography>
      </Section>
    </>
  );
}
