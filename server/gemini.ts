import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { AssessmentFormValues, AssessmentPackage } from '../src/types/assessment.ts';
import { generateAssessmentPrompt, DEPARTMENT_NAMES } from '../src/utils/backupPrompt.ts';

dotenv.config();

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const assessmentJsonSchema = {
  type: Type.OBJECT,
  properties: {
    metadata: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        school: { type: Type.STRING },
        teacherName: { type: Type.STRING },
        subject: { type: Type.STRING },
        gradeClass: { type: Type.STRING },
        department: { type: Type.STRING },
        departmentFullName: { type: Type.STRING },
        assessmentType: { type: Type.STRING },
        instrumentType: { type: Type.STRING },
        itemCount: { type: Type.INTEGER },
        date: { type: Type.STRING },
      },
      required: [
        'title',
        'school',
        'subject',
        'gradeClass',
        'department',
        'assessmentType',
        'instrumentType',
        'itemCount',
      ],
    },
    kisiKisi: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.INTEGER },
          learningObjective: { type: Type.STRING },
          topic: { type: Type.STRING },
          indicator: { type: Type.STRING },
          soloLevel: { type: Type.STRING },
          instrumentType: { type: Type.STRING },
          itemNumber: { type: Type.INTEGER },
          weightScore: { type: Type.NUMBER },
        },
        required: ['number', 'learningObjective', 'topic', 'indicator', 'soloLevel', 'instrumentType', 'itemNumber', 'weightScore'],
      },
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.INTEGER },
          instrumentType: { type: Type.STRING },
          soloLevel: { type: Type.STRING },
          stimulus: { type: Type.STRING },
          questionText: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                key: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ['key', 'text'],
            },
          },
          instructions: { type: Type.STRING },
          maxScore: { type: Type.NUMBER },
        },
        required: ['number', 'instrumentType', 'soloLevel', 'questionText', 'maxScore'],
      },
    },
    answerKeys: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.INTEGER },
          instrumentType: { type: Type.STRING },
          correctAnswer: { type: Type.STRING },
          fullAnswerText: { type: Type.STRING },
          explanation: { type: Type.STRING },
          expectedElements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['number', 'instrumentType', 'correctAnswer', 'explanation'],
      },
    },
    rubric: {
      type: Type.OBJECT,
      properties: {
        instrumentSummary: { type: Type.STRING },
        maxScore: { type: Type.NUMBER },
        scoringFormula: { type: Type.STRING },
        passingGradeAdvice: { type: Type.STRING },
        criteria: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              aspect: { type: Type.STRING },
              weight: { type: Type.NUMBER },
              levels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                  },
                  required: ['level', 'score', 'description'],
                },
              },
            },
            required: ['aspect', 'weight', 'levels'],
          },
        },
        followUpRecommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              action: { type: Type.STRING },
            },
            required: ['category', 'action'],
          },
        },
      },
      required: ['instrumentSummary', 'maxScore', 'scoringFormula', 'passingGradeAdvice', 'followUpRecommendations'],
    },
    qualityAudit: {
      type: Type.OBJECT,
      properties: {
        requestedItems: { type: Type.INTEGER },
        generatedItems: { type: Type.INTEGER },
        pgItemCount: { type: Type.INTEGER },
        allPgHave5Options: { type: Type.BOOLEAN },
        kisiKisiMappedCount: { type: Type.INTEGER },
        hasSeparateAnswerKey: { type: Type.BOOLEAN },
        hasRubric: { type: Type.BOOLEAN },
        notes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: [
        'requestedItems',
        'generatedItems',
        'pgItemCount',
        'allPgHave5Options',
        'kisiKisiMappedCount',
        'hasSeparateAnswerKey',
        'hasRubric',
        'notes',
      ],
    },
  },
  required: ['metadata', 'kisiKisi', 'questions', 'answerKeys', 'rubric', 'qualityAudit'],
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGeminiAssessment(form: AssessmentFormValues): Promise<AssessmentPackage> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('CONFIG_KEY_MISSING: Gemini API Key belum dikonfigurasi di environment server (GEMINI_API_KEY). Silakan periksa pengaturan secret atau gunakan Mode Manual Cadangan untuk menyalin prompt.');
  }

  const ai = getAiClient();
  const promptText = generateAssessmentPrompt(form);
  const systemInstruction = `Anda adalah Tim Pengembang Asesmen dan Kurikulum Kejuruan Maritim SUPM TEGAL (Sekolah Usaha Perikanan Menengah Tegal, Kementerian Kelautan dan Perikanan).
Kejuruan SUPM TEGAL meliputi:
1. NKPI (Nautika Kapal Penangkap Ikan): navigasi, ilmu pelayaran datar, astronomi, meteorologi laut, olah gerak kapal, aturan COLREG 1972, jaring lingkar, rawai tuna, trawl, keselamatan di laut.
2. TKPI (Teknika Kapal Penangkap Ikan): mesin diesel penggerak utama, motor bantu, mesin pendingin ikan (refrigerasi), kelistrikan kapal, sistem pneumatik, perbengkelan bubut/las kapal.
3. APPL (Agribisnis Perikanan Air Payau dan Laut): budidaya udang vaname, ikan bandeng, kerapu, kakap putih, manajemen kualitas air (DO, pH, salinitas, amonia), nutrisi/pakan, biosekuriti tambak.
4. APHP (Agribisnis Pengolahan Hasil Perikanan): sanitasi & higiene, penanganan ikan segar (cold chain), pengalengan (canning), surimi, fermentasi/terasi, pengasapan, sistem mutu HACCP, GMP, SSOP.

ATURAN WAJIB & NON-NEGOSIABLE:
1. JUMLAH SOAL: Hasilkan tepat ${form.itemCount} butir soal, dari nomor 1 sampai ${form.itemCount}.
2. PILIHAN GANDA (Jika bentuk instrumen PG atau Campuran): Setiap butir soal pilihan ganda WAJIB memiliki TEPAT 5 PILIHAN JAWABAN (A, B, C, D, dan E). TIDAK BOLEH berhenti di D! Opsi E harus selalu ada dan bermakna masuk akal.
3. KISI-KISI: Seluruh butir 1 sampai ${form.itemCount} harus tercantum di kisi-kisi dengan level SOLO (Prastruktural, Unistruktural, Multistruktural, Relasional, atau Abstrak Diperluas) dan indikator soal yang terukur.
4. NASKAH SOAL SISWA: Sama sekali TIDAK BOLEH memuat kunci jawaban, huruf tebal penanda jawaban, atau tulisan "Kunci:".
5. KUNCI JAWABAN: Dibuat terpisah lengkap dengan nomor butir, pilihan benar, penjelasan teknis ilmiah, dan kata kunci esensial.
6. RUBRIK PENSKORAN: Berikan pedoman penskoran yang adaptif sesuai bentuk instrumen dan jenis asesmen (${form.assessmentType}).
7. Output harus berupa JSON murni sesuai schema yang ditentukan.`;

  // Candidate models from gemini-api skill (prefer gemini-3.8-flash, fallback to gemini-flash-latest or gemini-3.1-flash-lite if spike)
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Memanggil model ${modelName} (Percobaan ${attempt + 1})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: assessmentJsonSchema as any,
            temperature: 0.3,
          },
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error('Respons model kosong. Silakan coba generate ulang.');
        }

        let parsed: AssessmentPackage;
        try {
          parsed = JSON.parse(responseText) as AssessmentPackage;
        } catch (parseErr) {
          throw new Error('Gagal mengurai respons JSON dari AI. Silakan coba kembali.');
        }

        // Strict post-processing audit
        parsed.metadata.school = 'SUPM TEGAL';
        parsed.metadata.department = form.department;
        parsed.metadata.departmentFullName = DEPARTMENT_NAMES[form.department] || form.department;
        parsed.metadata.teacherName = form.teacherName || 'Guru Pengampu SUPM TEGAL';
        parsed.metadata.subject = form.subject;
        parsed.metadata.gradeClass = form.gradeClass;
        parsed.metadata.assessmentType = form.assessmentType;
        parsed.metadata.instrumentType = form.instrumentType;
        parsed.metadata.itemCount = form.itemCount;
        parsed.metadata.date = new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        // Verification of PG options (each PG must have 5 options A-E)
        let pgCount = 0;
        let allFive = true;
        if (Array.isArray(parsed.questions)) {
          parsed.questions.forEach((q) => {
            if (q.instrumentType === 'Pilihan Ganda' || form.instrumentType === 'Pilihan Ganda') {
              pgCount++;
              if (!q.options || q.options.length < 5) {
                allFive = false;
                if (!q.options) q.options = [];
                const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
                while (q.options.length < 5) {
                  const nextKey = keys[q.options.length];
                  q.options.push({
                    key: nextKey,
                    text: `Opsi ${nextKey} belum terisi lengkap (silakan verifikasi)`,
                  });
                }
              }
            }
          });
        }

        parsed.qualityAudit = {
          requestedItems: form.itemCount,
          generatedItems: parsed.questions?.length || 0,
          pgItemCount: pgCount,
          allPgHave5Options: allFive,
          kisiKisiMappedCount: parsed.kisiKisi?.length || 0,
          hasSeparateAnswerKey: (parsed.answerKeys?.length || 0) > 0,
          hasRubric: Boolean(parsed.rubric && parsed.rubric.scoringFormula),
          notes: [
            `Perangkat Asesmen ${form.assessmentType} untuk ${form.subject} (Kelas ${form.gradeClass} - ${form.department}) berhasil diverifikasi sistem.`,
            allFive
              ? 'Seluruh butir Pilihan Ganda telah memenuhi standar 5 opsi (A–E).'
              : 'Beberapa opsi dilengkapi otomatis untuk memenuhi standar 5 opsi.',
            `Pemetaan Kisi-kisi: ${parsed.kisiKisi?.length || 0} butir terpetakan dengan level Taksonomi SOLO.`,
          ],
        };

        return parsed;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.error(`Panggilan ${modelName} percobaan ${attempt + 1} gagal:`, errMsg);

        if (errMsg.includes('CONFIG_KEY_MISSING') || errMsg.includes('API_KEY_INVALID') || errMsg.includes('401')) {
          throw new Error('API_KEY_INVALID: Kunci API Gemini tidak valid atau tidak memiliki izin akses. Pastikan GEMINI_API_KEY terdaftar dengan benar.');
        }

        if (attempt === 0) {
          await sleep(1500);
        }
      }
    }
    // If current model failed after 2 attempts, continue to next candidate model
  }

  // If all models failed
  const errText = lastError?.message || 'Terjadi gangguan koneksi ke layanan AI.';
  if (errText.includes('429') || errText.includes('RESOURCE_EXHAUSTED')) {
    throw new Error('KUOTA_HABIS: Kuota permintaan Gemini API sedang padat atau mencapai batas laju (Rate Limit / Quota Exceeded). Mohon tunggu sejenak atau gunakan tombol Salin Prompt Cadangan untuk eksekusi mandiri.');
  }
  if (errText.includes('503') || errText.includes('UNAVAILABLE')) {
    throw new Error('SERVER_SIBUK: Layanan server Gemini sedang mengalami lonjakan beban sesaat. Silakan coba kembali dalam beberapa detik atau gunakan Mode Prompt Cadangan.');
  }

  throw new Error(`GAGAL_GENERATE: ${errText}. Anda dapat menggunakan tombol Salin Prompt Cadangan untuk menjalankan asesmen di Gemini web.`);
}
