"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "@/components/action-button";
import { Header } from "@/components/header";
import { ProfileChip } from "@/components/profile-chip";
import { ease, fadeUp } from "@/lib/motion";
import { loadProfile, saveProfile } from "@/lib/storage";

const CONDITIONS = [
  "diabetic",
  "hypertension",
  "lactose_intolerant",
  "celiac",
  "high_cholesterol",
  "pcos",
  "ibs",
];
const GOALS = [
  "weight_loss",
  "muscle_gain",
  "reduce_sugar",
  "high_protein",
  "gut_health",
  "heart_health",
];
const ALLERGIES = [
  "peanuts",
  "tree_nuts",
  "shellfish",
  "eggs",
  "soy",
  "gluten",
  "dairy",
];

export default function ProfilePage() {
  const router = useRouter();
  const [conditions, setConditions] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setConditions(p.conditions ?? []);
      setGoals(p.goals ?? []);
      setAllergies(p.allergies ?? []);
    }
  }, []);

  function toggle(set: string[], v: string, fn: (n: string[]) => void) {
    fn(set.includes(v) ? set.filter((x) => x !== v) : [...set, v]);
  }

  function onSave() {
    saveProfile({ conditions, goals, allergies });
    toast.success("Profile saved.");
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-6 pb-32 pt-16">
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease }}
        >
          <span className="eyebrow">Personalize</span>
          <h1 className="mt-3 font-serif text-5xl italic md:text-6xl">
            Your profile
          </h1>
          <p className="mt-4 max-w-md text-text-dim">
            We use this to personalize every verdict. Nothing leaves your
            device.
          </p>
        </motion.div>

        <Group
          title="Conditions"
          values={CONDITIONS}
          selected={conditions}
          onToggle={(v) => toggle(conditions, v, setConditions)}
          delay={0.15}
        />
        <Group
          title="Goals"
          values={GOALS}
          selected={goals}
          onToggle={(v) => toggle(goals, v, setGoals)}
          delay={0.25}
        />
        <Group
          title="Allergies"
          values={ALLERGIES}
          selected={allergies}
          onToggle={(v) => toggle(allergies, v, setAllergies)}
          delay={0.35}
        />

        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease, delay: 0.5 }}
          className="mt-16"
        >
          <ActionButton onClick={onSave}>Save profile</ActionButton>
        </motion.div>
      </main>
    </div>
  );
}

function Group({
  title,
  values,
  selected,
  onToggle,
  delay,
}: {
  title: string;
  values: string[];
  selected: string[];
  onToggle: (v: string) => void;
  delay: number;
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.6, ease, delay }}
      className="mt-12 border-t border-border pt-8"
    >
      <h2 className="eyebrow mb-4">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <ProfileChip
            key={v}
            value={v}
            active={selected.includes(v)}
            onToggle={() => onToggle(v)}
          />
        ))}
      </div>
    </motion.section>
  );
}
