import { useState } from 'react';
import { BookOpen, BookText, ExternalLink, GraduationCap, ShieldCheck, Target, Truck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { temarios, temarioSources, type Language, type Temario } from '@/data/temarios';

interface TemariosTabProps {
  language: Language;
}

const accentClasses = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  violet: 'border-violet-200 bg-violet-50 text-violet-800',
};

export default function TemariosTab({ language }: TemariosTabProps) {
  const searchParams = new URLSearchParams(window.location.search);
  const directTopic = searchParams.get('topic');
  const openBook = searchParams.get('book') === 'full';
  const [selected, setSelected] = useState<Temario['id']>('common');
  const [bookExpanded, setBookExpanded] = useState(openBook);
  const temario = temarios.find((item) => item.id === selected) ?? temarios[0];
  const t = language === 'pt'
    ? {
        heading: 'Temarios completos',
        intro: 'Roteiro de estudo organizado pelos objetivos dos materiais CAP Comunes e CAP Mercancías. Abra cada tópico para ver o que estudar, os pontos de atenção e as fontes de consulta.',
        common: 'Comunes',
        goods: 'Mercancías',
        keyPoints: 'Pontos principais',
        examReview: 'Resumo completo',
        itemReview: 'Resumo por item e subitem',
        concept: 'Conceito e funcionamento',
        memorize: 'Para fixar',
        fullReading: 'Livro completo',
        sourceExcerpt: 'Transcrição literal corrigida',
        references: 'Fontes do tópico',
        sourceNote: 'Conteúdo didático. Para uma decisão profissional ou situação concreta, consulte sempre a redação consolidada da norma e as orientações oficiais em vigor.',
      }
    : {
        heading: 'Temarios completos',
        intro: 'Guía de estudio organizada por objetivos de los materiales CAP Comunes y CAP Mercancías. Abre cada tema para ver qué estudiar, los puntos de atención y las fuentes de consulta.',
        common: 'Comunes',
        goods: 'Mercancías',
        keyPoints: 'Puntos principales',
        examReview: 'Resumen completo',
        itemReview: 'Resumen por apartado y subapartado',
        concept: 'Concepto y funcionamiento',
        memorize: 'Para fijar',
        fullReading: 'Libro completo',
        sourceExcerpt: 'Transcripción literal corregida',
        references: 'Fuentes del tema',
        sourceNote: 'Contenido didáctico. Para una decisión profesional o un caso concreto, consulta siempre el texto consolidado de la norma y las orientaciones oficiales vigentes.',
      };

  const getSources = (ids: string[]) => temarioSources.filter((source) => ids.includes(source.id));

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-violet-900 p-6 text-white sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white/15 p-3"><BookOpen className="size-6" /></div>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">{t.heading}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">{t.intro}</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant={selected === 'common' ? 'default' : 'outline'}
              onClick={() => setSelected('common')}
              className="h-auto justify-start gap-3 px-4 py-4 text-left"
            >
              <GraduationCap className="size-5 shrink-0" />
              <span><span className="block font-bold">CAP {t.common}</span><span className="mt-0.5 block text-xs opacity-80">{temarios[0].subtitle[language]}</span></span>
            </Button>
            <Button
              variant={selected === 'goods' ? 'default' : 'outline'}
              onClick={() => setSelected('goods')}
              className="h-auto justify-start gap-3 px-4 py-4 text-left"
            >
              <Truck className="size-5 shrink-0" />
              <span><span className="block font-bold">CAP {t.goods}</span><span className="mt-0.5 block text-xs opacity-80">{temarios[1].subtitle[language]}</span></span>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-blue-700" />
          <div><h3 className="text-2xl font-bold text-slate-900">{temario.title[language]}</h3><p className="text-sm text-slate-600">{temario.subtitle[language]}</p></div>
        </div>

        {temario.blocks.map((block) => (
          <Card key={block.id} className={`overflow-hidden border ${accentClasses[block.accent]}`}>
            <CardContent className="p-0">
              <div className="border-b border-current/15 px-5 py-4 sm:px-6">
                <h4 className="font-bold">{block.title[language]}</h4>
                <p className="mt-1 text-sm opacity-90">{block.description[language]}</p>
              </div>
              <Accordion type="multiple" defaultValue={directTopic ? [directTopic] : undefined} className="bg-white px-5 sm:px-6">
                {block.topics.map((topic) => (
                  <AccordionItem key={topic.id} value={topic.id}>
                    <AccordionTrigger className="py-5 hover:no-underline">
                      <span className="pr-3"><Badge variant="outline" className="mr-2 border-slate-300 bg-slate-50 text-slate-600">{topic.code}</Badge><span className="font-semibold text-slate-900">{topic.title[language]}</span></span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <p className="leading-6 text-slate-700">{topic.summary[language]}</p>
                      <div className={`mt-4 rounded-xl p-4 ${topic.fullReading ? 'border border-amber-200 bg-amber-50' : 'bg-slate-50'}`}>
                        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">{topic.fullReading ? <Target className="size-4 text-amber-700" /> : null}{topic.detailedSummary ? t.itemReview : topic.fullReading ? t.examReview : t.keyPoints}</p>
                        {topic.detailedSummary ? (
                          <div className="space-y-3">
                            {topic.detailedSummary.map((item) => (
                              <article key={item.code} className="rounded-lg border border-amber-200/80 bg-white p-3.5 shadow-sm sm:p-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className="border-amber-300 bg-amber-50 font-mono text-[11px] font-bold text-amber-900">{item.code}</Badge>
                                  <h5 className="text-sm font-bold text-slate-900">{item.title[language]}</h5>
                                </div>
                                <div className="mt-3 border-l-2 border-amber-400 pl-3">
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">{t.concept}</p>
                                  <p className="mt-1 text-sm leading-6 text-slate-700">{item.concept[language]}</p>
                                </div>
                                <div className="mt-3">
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-blue-800">{t.memorize}</p>
                                  <ul className="mt-1.5 space-y-1.5 text-sm leading-6 text-slate-700">
                                    {item.essentials[language].map((point) => <li key={point} className="flex gap-2"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-blue-600" />{point}</li>)}
                                  </ul>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <ul className="space-y-2 text-sm leading-6 text-slate-700">
                            {topic.points[language].map((point) => <li key={point} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-600" />{point}</li>)}
                          </ul>
                        )}
                      </div>
                      {topic.fullReading && (
                        <details open={bookExpanded} onToggle={(event) => setBookExpanded(event.currentTarget.open)} className="mt-4 overflow-hidden rounded-xl border border-blue-200 bg-white">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-950 marker:content-none hover:bg-blue-100">
                            <span className="flex items-center gap-2"><BookText className="size-4 text-blue-700" />{t.fullReading}</span>
                            <Badge variant="outline" className="border-blue-200 bg-white text-[10px] font-medium text-blue-700">{t.sourceExcerpt}</Badge>
                          </summary>
                          <div className="space-y-6 border-t border-blue-100 px-4 py-5 sm:px-5">
                            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">{topic.fullReading.note[language]}</p>
                            {topic.fullReading.literalText ? <pre className="whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-4 font-sans text-sm leading-7 text-slate-700">{topic.fullReading.literalText}</pre> : null}
                            {topic.fullReading.blocks?.map((readingBlock) => (
                              <section key={readingBlock.title.es} className="space-y-3">
                                <h5 className="border-l-4 border-blue-600 pl-3 text-sm font-bold text-slate-900">{readingBlock.title[language]}</h5>
                                {readingBlock.paragraphs?.map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-slate-700">{paragraph}</p>)}
                                {readingBlock.items && (
                                  <dl className="overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
                                    {readingBlock.items.map((item) => <div key={item.label} className="border-b border-slate-100 px-3 py-3 last:border-0 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-4"><dt className="font-bold text-slate-900">{item.label}</dt><dd className="mt-1 leading-6 text-slate-700 sm:mt-0">{item.body}</dd></div>)}
                                  </dl>
                                )}
                                {readingBlock.bullets && <ul className="space-y-2 text-sm leading-6 text-slate-700">{readingBlock.bullets.map((bullet) => <li key={bullet} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-600" />{bullet}</li>)}</ul>}
                              </section>
                            ))}
                          </div>
                        </details>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                        <span className="font-semibold text-slate-500">{t.references}:</span>
                        {getSources(topic.sourceIds).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 underline-offset-2 hover:underline">{source.label}<ExternalLink className="size-3" /></a>)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </section>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">{t.sourceNote}</p>
    </div>
  );
}
