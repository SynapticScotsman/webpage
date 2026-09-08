# The ICNS page, as a document

Copy this into the page document. Every table is a block. The first cell of a
table names the block, with variants in brackets. A horizontal rule starts a new
section.

Structures here were read from your own page's source (`/icns.plain.html`) on
3 September 2026, so they match what the project already renders rather than what
the generic boilerplate expects:

- **Carousel and cards**: two cells per row. Cell one is the image. Cell two holds
  a heading, one or more paragraphs, then a paragraph containing a link, which the
  block renders as a button.
- **Tabs**: one row per tab. Cell one is the tab label, the rest is the panel.
- **Embed**: one cell containing the video link.

Nested blocks are avoided throughout. Putting a table inside a table cell is
unreliable in Edge Delivery Services, so each sector is its own section with its
own cards block, which is the pattern your current page already uses successfully.

Text marked `[CONFIRM]` needs checking before publication.

---

## Section 1 — The claim, and the proof

| Carousel |
| :--- |

| ![Event camera footage of a total lunar eclipse](media/eclipse.jpg) | ## Nothing fires until something changes<br><br>A pixel in a silicon retina reports only when its own light changes. A neuron in a spiking network fires only when its input does. Same principle, sensor to processor, and the reason both are fast and cost so little power.<br><br>[See the recorded work](#the-work) |

One row, not four. Three of the current four slides are only reached by someone
who chooses to click through, and almost nobody does, so three of the centre's
headline messages go unread. If the project's `hero` block turns out to author
cleanly, it is the better home for this; the carousel with a single row is the
version proven to work on your page today.

| Embed |
| :--- |
| https://www.youtube.com/watch?v=5ct78VxCGlQ |

An event camera outputs nothing at all when nothing moves, which makes a still
photograph the wrong way to show this work. The eclipse is the clearest single
demonstration: the illuminated and the eclipsed portions of the moon stay clear
together, where a conventional sensor exposes for the brighter lit area and loses
the rest.

---

## Section 2 — What we built

## Three things we built

| Cards (btn-outline, cards-crimson) |
| :--- |

| ![Event cameras on the International Space Station](media/falcon-neuro.jpg) | ### Falcon Neuro<br><br>Event cameras operating on the International Space Station since 2022, built with the United States Air Force Academy, watching lightning and upper-atmosphere sprites from orbit. The first event-based images ever captured from space.<br><br>[About Falcon Neuro](/icns/news/biology-inspired-cameras-on-the-international-space-station) |
| ![The DeepSouth supercomputer](media/deepsouth.jpg) | ### DeepSouth<br><br>A supercomputer built to simulate spiking neural networks at the scale of the human brain, on reconfigurable commodity hardware at a fraction of conventional power. `[CONFIRM]` operating status and figures.<br><br>[About DeepSouth](https://www.deepsouth.org.au/) |
| ![The Astrosite mobile observatory](media/astrosite.jpg) | ### Astrosite<br><br>A shipping container of event-based telescopes that tracks satellites in full daylight, where conventional optics saturate and lose the target. It travels, so it deploys to a site rather than requiring you to come to Werrington.<br><br>[Astrosite footage](/icns/resources/research-videos) |

---

## Section 3 — Space and defence

## Space &amp; defence

Tracking in daylight, from orbit, or through obscured air, where optical systems
saturate or lose the target.

| Cards (cards-horizontal, btn-outline) |
| :--- |

| ![Star map generated from stars crossing the field of view](media/sky-mapping.jpg) | ### Simultaneous sky mapping and satellite tracking<br><br>A star map builds continuously from the stars passing through the field of view. Their positions then reveal the motion of the telescope itself.<br><br>[Watch](/icns/resources/research_videos/sky_mapping_satellite_tracking) |
| ![The moon held steady on a cloudy night](media/seeing-the-moon.jpg) | ### Seeing the moon through cloud<br><br>The telescope holds the moon still on a cloudy night. Because the cloud and the moon cross the sensor at different speeds, it separates them.<br><br>[Watch](/icns/resources/research_videos/seeing_the_moon) |
| ![Acoustic drone detection](media/acoustic-drone.jpg) | ### Hearing what you cannot see<br><br>Not everything neuromorphic is a camera. A model of biological hearing picks an aerial drone out of a cluttered soundscape when smoke, foliage or darkness has taken vision away. `[CONFIRM]` status.<br><br>[Doctoral topics](#study) |

---

## Section 4 — Industry and manufacturing

## Industry &amp; manufacturing

Inspection and monitoring beyond frame rate: fast lines, vibration, faults that
appear between frames. Capability established, seeking first industry partners.

| Cards (cards-horizontal, btn-outline) |
| :--- |

| ![Near and far objects separating by how fast they cross the frame](media/segregation.jpg) | ### Separating a scene by motion alone<br><br>Objects close to you cross the frame faster than distant ones when you are moving, as in a car or a train. That difference alone pulls them apart, with no recognition step.<br><br>[Watch](/icns/resources/research_videos/image_segregation) |
| ![Several sensor streams combined into one](media/fusion.jpg) | ### Many sensors, one sensor<br><br>The high temporal resolution of event-based sensors lets several of them fuse seamlessly into a single larger sensor, covering a wider line without a stitching step.<br><br>[Watch](/icns/resources/research_videos/fusion_of_multiple_sensors) |
| ![Event-based vision chip](media/silicon.jpg) | ### Silicon that spikes<br><br>The processor side of the centre, which produces no footage and half the research: spiking networks on chip, integrated circuit design for event sensors, and instruction set extensions that let a conventional core carry neuromorphic work. `[CONFIRM]` status.<br><br>[Doctoral topics](#study) |

---

## Section 5 — Agriculture and environment

## Agriculture &amp; environment

Counting and classifying living things in cluttered outdoor scenes, on battery,
with no network.

| Cards (cards-horizontal, btn-outline) |
| :--- |

| ![A bee against moving foliage](media/bees.jpg) | ### Counting what moves<br><br>Picking a bee out of moving foliage by how it moves rather than how bright it is, at wingbeat rates a frame camera cannot resolve. The same method finds a pest in a greenhouse. `[CONFIRM]` status.<br><br>[Doctoral topics](#study) |
| ![Acoustic monitoring in bushland](media/acoustic-eco.jpg) | ### Listening to a landscape<br><br>Low-power acoustic sensing for ecological survey, including automated koala detection and bushfire risk assessed from the sound of a landscape. `[CONFIRM]` status.<br><br>[Doctoral topics](#study) |

---

## Section 6 — Health and assistive

## Health &amp; assistive

Low-power sensing and models of biological hearing, applied to assessment,
monitoring and hearing itself.

| Cards (cards-horizontal, btn-outline) |
| :--- |

| ![Cochlear model output](media/carfac.jpg) | ### Modelling the human auditory system<br><br>The CAR-FAC cochlear model responding to "54-46" by Toots and the Maytals, the band often credited with naming reggae.<br><br>[Watch](/icns/resources/research_videos/modelling_the_human_auditory_system) |
| ![Speech assessment research](media/speech.jpg) | ### Speech and reading assessment<br><br>Automated tools for assessing children's reading and for tracking speech progress in late talkers, built on the same auditory modelling. `[CONFIRM]` status.<br><br>[Doctoral topics](#study) |

---

## Section 7 — Study with us

## Work with us on this

Recruitment here is continuous. There is no closing date and no application
window. The list below is directions we would supervise, not vacancies that open
and close. Most scope to any of three levels: a capstone takes a slice, a masters
project takes a stage, a doctorate takes the whole question.

| Columns |
| :--- |

| **Capstone**<br><br>Final-year undergraduate project. A scoped slice of live work: one sensor, one dataset, one question, finished within the session. Open to any Western Sydney final-year engineering or computing student. | **Masters**<br><br>Master of Applied Neuromorphic Engineering. A world-first degree spanning electrical engineering, computer science, neuroscience and mathematics, taught by the people building the field.<br><br>[About the degree](/icns/masters-program) | **Doctorate**<br><br>One of the directions below, taken the whole way. Scholarships are applied for alongside a project rather than before one, so start with the topic and the supervisor, not the paperwork. `[CONFIRM]` routes and duration. |

| Columns |
| :--- |

| **Space &amp; defence**<br><br>Astrometry with event-based vision sensors · Cold-start astrometry for airspace and space-object tracking · Bio-inspired sensors for space situational awareness · Event-based wavefront sensing · Maritime situational awareness · Acoustic aerial drone detection · Underwater drone detection using marine-mammal audition | **Industry &amp; manufacturing**<br><br>Performance metrics for closed-loop event-based imaging · Neuromorphic cyber security at the edge · Control systems inspired by insect central pattern generators · Fault-tolerant distributed swarm intelligence · Neuromorphic computing in extreme environments |
| **Agriculture &amp; environment**<br><br>Honey bee waggle dance detection · Low-power acoustic ecological monitoring · Bushfire risk from acoustic scenes · Environmental situational awareness with vision sensors and inertial mapping | **Health &amp; assistive**<br><br>A neuromorphic auditory pathway for sensing the surrounding environment · Automated child reading assessment · Tools for therapists monitoring speech progress in late talkers |
| **Sensors, chips &amp; computing**<br><br>Integrated circuit design for event-based vision sensors · A ferroelectric field-effect chip for spiking networks · RISC-V instruction set extensions · Event-based deep networks using minifloats · Physics-based encoding · Task-driven evaluation of large-scale spiking networks · Neuromorphic computational imaging | Send a page describing what you would want to do and who you would want to work with, and we will tell you honestly whether it fits.<br><br>[Write to the centre](/icns/contact-us) |

The University also publishes a list of specific funded doctoral projects. It lags
behind what we are actually supervising, so treat it as a sample rather than the
full set.

---

## Section 8 — Tools and data

## Take it and use it

The centre writes and maintains the software it uses, and publishes it openly.
Several are depended on by groups elsewhere. If you want to try event-based vision
without buying a camera, start with the simulator.

| Cards (cards-horizontal, cards-image-small, cards-off-white) |
| :--- |

| ![IEBCS](media/tool-iebcs.jpg) | ### IEBCS<br><br>The centre's event-based camera simulator. Generate realistic event streams from conventional footage, so you can develop against the sensor before you own one.<br><br>[On GitHub](https://github.com/neuromorphicsystems/IEBCS) |
| ![neuromorphic-drivers](media/tool-drivers.jpg) | ### neuromorphic-drivers<br><br>Talk to event cameras in real time from Python or Rust, without the vendor stack getting in the way.<br><br>[On GitHub](https://github.com/neuromorphicsystems/neuromorphic-drivers) |
| ![astrometry](media/tool-astrometry.jpg) | ### astrometry<br><br>Turns a list of star positions into a pixel-to-sky transformation. The plate-solving step behind the sky-mapping footage above.<br><br>[On GitHub](https://github.com/neuromorphicsystems/astrometry) |
| ![land](media/tool-land.jpg) | ### land<br><br>A maintained list of the neuromorphic datasets available anywhere, not only the centre's own. Where to start if you need data rather than hardware.<br><br>[On GitHub](https://github.com/neuromorphicsystems/land) |

---

## Section 9 — Access and contact

## Bring us a measurement problem

Most partnerships start with a short scoping conversation. Tell us what you need
to see, how fast it moves, what light it sits in, and what power you have where it
lives. Those four facts decide almost everything.

| Table (dynamic-width, no-border, two-column-table) |
| :--- |

| **Event cameras and the lab**<br>Available now | Commercial and research event-based sensors, the recording rigs built around them, and the people who know how to get clean data out of them. The answer usually comes from one afternoon of recording rather than a study. |
| **Astrosite**<br>Available by arrangement | A mobile observatory that travels to a site. The useful first question is what you need observed and when. `[CONFIRM]` |
| **DeepSouth**<br>`[CONFIRM] status` | Say plainly whether access requests are open. If it is not in service, saying so is better than collecting details and going quiet. |
| **Software and data**<br>Open, no agreement needed | Published openly and needing no permission, no agreement and no conversation. |
| **Partnerships** | Contract research, joint bids, student projects, licensing. `[CONFIRM]` terms and lead times. |
| **Contact** | ICNS@westernsydney.edu.au · Level 2, Building BA, Werrington South campus, Great Western Highway, Werrington NSW 2747 |

---

| Metadata |
| :--- |
| Title | International Centre for Neuromorphic Systems |
| Description | The International Centre for Neuromorphic Systems builds sensors that report change rather than capturing frames, and processors that compute in spikes. Event cameras on the International Space Station, and DeepSouth, built to simulate spiking networks at the scale of the human brain. |
| Image | media/eclipse.jpg |
