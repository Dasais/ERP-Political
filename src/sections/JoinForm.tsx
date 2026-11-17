import { useState, type FormEvent } from "react";
import { trpc } from "@/providers/trpc";

type FieldErrors = {
  fullName?: string;
  age?: string;
  contact?: string;
  noOtherParty?: string;
};

export default function JoinForm() {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [noOtherParty, setNoOtherParty] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const mutation = trpc.applications.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: () => {
      setErrors({ contact: "Не удалось отправить заявку. Попробуйте позже." });
    },
  });

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (fullName.trim().length < 3) next.fullName = "Укажите имя и фамилию полностью";
    const ageNum = Number(age);
    if (!age.trim() || !Number.isInteger(ageNum) || ageNum < 18)
      next.age = "Вступление возможно только с 18 лет";
    else if (ageNum > 120) next.age = "Проверьте указанный возраст";
    if (contact.trim().length < 3)
      next.contact = "Укажите номер телефона или Discord";
    if (!noOtherParty)
      next.noOtherParty = "Необходимо подтвердить отсутствие членства в других партиях";
    return next;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    mutation.mutate({
      fullName: fullName.trim(),
      age: Number(age),
      contact: contact.trim(),
      noOtherParty: true,
    });
  };

  const reset = () => {
    setFullName("");
    setAge("");
    setContact("");
    setNoOtherParty(false);
    setErrors({});
    setSubmitted(false);
  };

  const inputClass = (hasError?: string) =>
    `min-h-[52px] w-full border bg-ink-950/70 px-4 text-[15px] text-paper placeholder:text-paper-dim/50 transition-colors duration-300 focus:border-gold-400 focus:outline-none ${
      hasError ? "border-red-500/70" : "border-gold-500/20 hover:border-gold-500/40"
    }`;

  return (
    <section id="join" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="reveal">
            <p className="kicker">Присоединяйтесь</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
              Вступление в партию
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-paper-dim sm:text-lg">
              Партия сильна своими членами. Оставьте заявку — Высший Совет рассмотрит
              её в течение 7 дней и свяжется с вами по указанному контакту.
            </p>
            <ol className="mt-10 space-y-6">
              {[
                ["Заполните форму", "Имя и фамилия, возраст от 18 лет, телефон или Discord."],
                ["Рассмотрение Советом", "Высший Совет проверяет заявку и соответствие Уставу."],
                ["Вы — член партии", "Поздравляем: теперь закон защищает вас, а вы контролируете власть."],
              ].map(([title, text], i) => (
                <li key={title} className="flex gap-5">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold-500/40 font-display text-lg font-bold text-gold-300"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-paper">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-paper-dim sm:text-[15px]">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="reveal" style={{ ["--reveal-delay" as string]: "140ms" }}>
            {submitted ? (
              <div className="gold-frame flex h-full min-h-[420px] flex-col items-center justify-center bg-ink-900 p-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 text-gold-300">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4.5 12.5 10 18 19.5 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-6 font-display text-3xl font-bold text-paper">Заявка принята</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-paper-dim">
                  Спасибо! Ваше обращение передано Высшему Совету. Решение будет
                  направлено по указанному контакту в течение 7 дней.
                </p>
                <button type="button" onClick={reset} className="btn-gold mt-8 min-h-[48px] px-7 text-sm">
                  Подать ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="gold-frame bg-ink-900 p-7 sm:p-9">
                <h3 className="font-display text-2xl font-bold text-paper">Заявка на вступление</h3>

                <div className="mt-7 space-y-5">
                  <div>
                    <label htmlFor="join-name" className="mb-2 block text-sm font-semibold text-paper/90">
                      Имя и фамилия
                    </label>
                    <input
                      id="join-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Например: Джеймс Картер"
                      className={inputClass(errors.fullName)}
                      aria-invalid={!!errors.fullName}
                    />
                    {errors.fullName && <p className="mt-2 text-sm text-red-400">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label htmlFor="join-age" className="mb-2 block text-sm font-semibold text-paper/90">
                      Возраст
                    </label>
                    <input
                      id="join-age"
                      type="number"
                      min={1}
                      max={120}
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Полных лет (от 18)"
                      className={inputClass(errors.age)}
                      aria-invalid={!!errors.age}
                    />
                    {errors.age && <p className="mt-2 text-sm text-red-400">{errors.age}</p>}
                  </div>

                  <div>
                    <label htmlFor="join-contact" className="mb-2 block text-sm font-semibold text-paper/90">
                      Телефон или спецсвязь (Discord)
                    </label>
                    <input
                      id="join-contact"
                      type="text"
                      autoComplete="tel"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="+1 … или username"
                      className={inputClass(errors.contact)}
                      aria-invalid={!!errors.contact}
                    />
                    {errors.contact && <p className="mt-2 text-sm text-red-400">{errors.contact}</p>}
                  </div>

                  <div>
                    <label className="flex cursor-pointer items-start gap-3 py-1" htmlFor="join-party">
                      <input
                        id="join-party"
                        type="checkbox"
                        checked={noOtherParty}
                        onChange={(e) => setNoOtherParty(e.target.checked)}
                        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer appearance-none border border-gold-500/40 bg-ink-950/70 transition-colors duration-200 checked:border-gold-400 checked:bg-gold-500"
                      />
                      <span className="text-sm leading-relaxed text-paper/85">
                        Подтверждаю, что не состою в составе других политических партий
                        штата (Article 4.2 Закона «О политических партиях»)
                      </span>
                    </label>
                    {errors.noOtherParty && <p className="mt-2 text-sm text-red-400">{errors.noOtherParty}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="btn-gold mt-8 min-h-[52px] w-full text-base disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mutation.isPending ? "Отправка…" : "Отправить заявку"}
                </button>
                <p className="mt-4 text-center text-xs leading-relaxed text-paper-dim">
                  Нажимая кнопку, вы соглашаетесь с Уставом партии и подтверждаете
                  достижение 18-летнего возраста.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
