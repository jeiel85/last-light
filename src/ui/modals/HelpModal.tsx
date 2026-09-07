import { Modal } from '@ui/components/Modal';

/** A short, honest explanation of the loop. It is not a tutorial and does not pretend to be. */
export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play" onClose={onClose} size="narrow">
      <div className="readable col gap-3">
        <section>
          <h3 className="label">The loop</h3>
          <p className="prose">
            Each day you assign people to jobs, spend what you have on facilities, research, and gear,
            then press <strong>End day</strong>. Overnight the vault produces and consumes, people get
            hungry and tired, machines wear out, and the world asks you a question or two.
          </p>
        </section>
        <section>
          <h3 className="label">Scarcity</h3>
          <p className="prose">
            Eight resources run the vault. Water and food kill you fastest; power decides which
            facilities work at all; hope decides whether anyone still cooperates. Every gauge in the
            status rail opens into the exact terms that produced it — click the <em>in</em> and{' '}
            <em>out</em> chips.
          </p>
        </section>
        <section>
          <h3 className="label">People</h3>
          <p className="prose">
            Survivors have skills, traits, injuries, and opinions about each other. Work output is a
            single multiplier you can inspect on their card. Somebody who is exhausted, starving, or
            grieving is close to useless — and rest is a job like any other.
          </p>
        </section>
        <section>
          <h3 className="label">Going outside</h3>
          <p className="prose">
            Expeditions are the only source of most materials. The planner previews combat power,
            carrying capacity, and injury and death risk before you commit, and names what is wrong
            with your plan. Nobody dies without that number having been on screen first.
          </p>
        </section>
        <section>
          <h3 className="label">Endings</h3>
          <p className="prose">
            A run lasts 20–60 days and ends in one of eight ways. Legacy earned from an ending unlocks
            scenarios, traits, and starting kits for later runs — but the thing that really carries
            over is what you now know.
          </p>
        </section>
        <section>
          <h3 className="label">Keys</h3>
          <p className="prose mono">1–7 switch panels · Esc closes a dismissible dialog · Tab cycles focus</p>
        </section>
      </div>
    </Modal>
  );
}
