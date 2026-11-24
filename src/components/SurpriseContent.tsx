
"use client";


import RomanticLetter from "@/components/RomanticLetter";
import type { Surprise } from "@/data/surprises";
import PolaroidMemory from "@/components/PolaroidMemory";
import RomanticQuiz from "@/components/RomanticQuiz";
import RomanticVoucher from "@/components/RomanticVoucher";
import SpecialSurprise from "@/components/SpecialSurprise";

type Props = {
  surprise: Surprise;
  redeemed: boolean;
  onRedeemChange: (value: boolean) => void;
};

export default function SurpriseContent({
  surprise,
  redeemed,
  onRedeemChange,
}: Props) {

  // CARTAS
  if (surprise.type === "letter") {
    return (
      <RomanticLetter
        title={surprise.title}
        message={surprise.message}
      />
    );
  }

  // FOTOGRAFÍAS

  if (surprise.type === "photo") {
    return (
      <PolaroidMemory
        key={surprise.day}
        title={surprise.title}
        message={surprise.message}
        image={surprise.image}
      />
    );
  }


  // JUEGOS

  if (surprise.type === "quiz") {
    return (
      <RomanticQuiz
        key={surprise.day}
        day={surprise.day}
        question={surprise.question}
        message={surprise.message}
        options={surprise.options}
        correctAnswer={surprise.correctAnswer}
        reward={surprise.reward}
      />
    );
  }


  // VALES REGALO
  
if (surprise.type === "voucher") {
  return (
    <RomanticVoucher
      key={surprise.day}
      day={surprise.day}
      title={surprise.title}
      message={surprise.message}
      reward={surprise.reward}
      redeemed={redeemed}
      onRedeemChange={onRedeemChange}
    />
  );
}


  // SORPRESAS ESPECIALES
  
if (surprise.type === "special") {
  return (
    <SpecialSurprise
      key={surprise.day}
      day={surprise.day}
      title={surprise.title}
      message={surprise.message}
      emoji={surprise.emoji}
      songUrl={surprise.songUrl}
    />
  );
}


  return null;
}
