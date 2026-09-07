import { Modal } from '@ui/components/Modal';
import { useT } from '@ui/hooks/useTranslation';

const SECTIONS = ['loop', 'scarcity', 'people', 'outside', 'endings'] as const;

/** A short, honest explanation of the loop. It is not a tutorial and does not pretend to be. */
export function HelpModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <Modal title={t('help.title')} onClose={onClose} size="narrow">
      <div className="readable col gap-3">
        {SECTIONS.map((id) => (
          <section key={id}>
            <h3 className="label">{t(`help.${id}.title`)}</h3>
            <p className="prose">{t(`help.${id}.body`)}</p>
          </section>
        ))}
        <section>
          <h3 className="label">{t('help.keys.title')}</h3>
          <p className="prose mono">{t('help.keys.body')}</p>
        </section>
      </div>
    </Modal>
  );
}
