// WhatsApp pre-filled messages (shared by the build and, as JSON, by the browser).
// {code} = maid reference code, {pkg} = package name, {cat} = package category.
export const MESSAGES = {
  general: {
    ms: 'Hi {name}, saya berminat untuk mendapatkan pembantu rumah. Boleh kongsikan biodata dan pakej yang tersedia?',
    en: 'Hi {name}, I am interested in hiring a maid. May I know more about your available biodata and packages?'
  },
  consult: {
    ms: 'Hi {name}, saya ingin mendapatkan konsultasi percuma tentang pengambilan pembantu rumah.',
    en: 'Hi {name}, I would like a free consultation about hiring a maid.'
  },
  indonesian: {
    ms: 'Hi {name}, saya berminat untuk mendapatkan pembantu rumah Indonesia. Boleh kongsikan biodata dan pakej yang tersedia?',
    en: 'Hi {name}, I am interested in hiring an Indonesian maid. May I know more about your available biodata and packages?'
  },
  filipino: {
    ms: 'Hi {name}, saya berminat untuk mendapatkan pembantu rumah Filipina. Boleh kongsikan biodata dan pakej yang tersedia?',
    en: 'Hi {name}, I am interested in hiring a Filipino maid. May I know more about your available biodata and packages?'
  },
  childcare: {
    ms: 'Hi {name}, saya mencari pembantu rumah untuk menjaga kanak-kanak. Boleh kongsikan biodata dan pakej yang sesuai?',
    en: 'Hi {name}, I am looking for a maid to help with childcare. May I know about suitable biodata and packages?'
  },
  elderly: {
    ms: 'Hi {name}, saya mencari pembantu rumah untuk menjaga warga emas. Boleh kongsikan biodata dan pakej yang sesuai?',
    en: 'Hi {name}, I am looking for a maid to help with elderly care. May I know about suitable biodata and packages?'
  },
  household: {
    ms: 'Hi {name}, saya mencari pembantu rumah untuk kerja rumah harian. Boleh kongsikan biodata dan pakej yang sesuai?',
    en: 'Hi {name}, I am looking for a maid for household duties. May I know about suitable biodata and packages?'
  },
  biodata: {
    ms: 'Hi {name}, saya ingin meminta biodata pembantu rumah {maid} (kod rujukan {code}). Boleh saya tahu status terkini dan langkah seterusnya?',
    en: 'Hi {name}, I would like to request the biodata of {maid} (reference code {code}). May I know her current status and the next steps?'
  },
  package: {
    ms: 'Hi {name}, saya berminat dengan pakej {pkg} ({cat}). Boleh berikan butiran pakej dan sebut harga terkini?',
    en: 'Hi {name}, I am interested in the {pkg} package ({cat}). May I have the current package details and quotation?'
  }
};

export function buildMessage(key, lang, vars = {}, ref = '') {
  const tpl = (MESSAGES[key] || MESSAGES.general)[lang] || MESSAGES.general.ms;
  let text = tpl.replace(/\{(\w+)\}/g, (_, n) => (vars[n] ?? ''));
  if (ref) text += ` (Ref: ${ref})`;
  return text;
}
