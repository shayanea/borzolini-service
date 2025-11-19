import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingActivity, ActivityDifficulty } from './entities/training-activity.entity';
import { TrainingActivitySpecies } from './entities/training-activity-species.entity';
import { PetSpecies } from '../breeds/entities/breed.entity';
import * as crypto from 'crypto';

interface ActivityData {
  title: string;
  summary: string;
  content_markdown: string;
  difficulty: ActivityDifficulty;
  avg_duration_minutes: number;
  tags: string[];
  video_url?: string;
  species_info: { species: PetSpecies; suitability: string }[];
}

@Injectable()
export class TrainingSeeder {
  private readonly logger = new Logger(TrainingSeeder.name);

  constructor(
    @InjectRepository(TrainingActivity) private readonly activityRepo: Repository<TrainingActivity>,
    @InjectRepository(TrainingActivitySpecies) private readonly activitySpeciesRepo: Repository<TrainingActivitySpecies>,
  ) {}

  private createHash(data: string): Buffer {
    return crypto.createHash('sha256').update(data).digest();
  }

  async seed() {
    this.logger.log('🌱 Starting training activities seeding...');
    await this.seedActivities();
    this.logger.log('✅ Training activities seeding completed.');
  }

  async clear() {
    this.logger.log('🧹 Clearing training activities data...');
    // Clear dependent table first
    await this.activitySpeciesRepo.query('DELETE FROM "training_activity_species"');
    // Clear parent table
    await this.activityRepo.query('DELETE FROM "training_activities"');
  }

  async seedActivities() {
    const dogBasics: ActivityData[] = [
      {
        title: 'Puppy Kindergarten: Socialization',
        summary: 'Essential early socialization for a confident adult dog.',
        content_markdown: `
### Why Socialize?
Socialization is about exposing your puppy to the world in a positive way. The critical window closes around 16 weeks.

### The Checklist
1. **People**: Men, women, children, people with hats, sunglasses, beards.
2. **Surfaces**: Grass, concrete, carpet, tile, gravel, wet surfaces.
3. **Sounds**: Traffic, vacuum cleaners, thunder (use recordings initially), doorbells.
4. **Handling**: Touching ears, paws, tail, mouth (prepare for vet visits).

### Steps
1. Keep sessions short and positive.
2. Use high-value treats for every new experience.
3. **Never force** interaction. Let the puppy approach at their own pace.
4. If the puppy shows fear (tucked tail, backing away), increase distance and reward for calmness.
        `,
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 15,
        tags: ['puppy', 'socialization', 'essential', 'behavior'],
        video_url: 'https://www.youtube.com/watch?v=0u3wRfgYjOk', // Zak George - Puppy Socialization
        species_info: [{ species: PetSpecies.DOG, suitability: 'Critical for puppies under 16 weeks.' }],
      },
      {
        title: 'Potty Training 101',
        summary: 'The definitive guide to housebreaking your dog.',
        content_markdown: `
### The Golden Rules
* **Supervision**: If you can't watch them, crate or tether them.
* **Schedule**: Puppies need to go out after sleeping, eating, drinking, and playing.
* **Reward**: Throw a party (treats + praise) immediately *after* they finish outside.

### Steps
1. Take puppy out on a leash to the same spot every time.
2. Say a cue phrase like "Go Potty" while they are sniffing.
3. Wait patiently (no playing).
4. **The second** they finish, praise heavily and give a treat.
5. If they don't go, back in the crate for 10 mins, then try again.

### Accidents
* If you catch them in the act: Interrupt with a noise ("Ah-ah!"), then immediately take outside.
* If you find it later: Clean it up. Do not punish. They won't understand.
        `,
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 10,
        tags: ['house-training', 'puppy', 'essential', 'hygiene'],
        video_url: 'https://www.youtube.com/watch?v=7vOXWCewEYM', // Zak George - Potty Training
        species_info: [{ species: PetSpecies.DOG, suitability: 'Essential for all untrained dogs.' }],
      },
      {
        title: 'Crate Training Basics',
        summary: 'Creating a safe, happy den for your dog.',
        content_markdown: `
### Introduction
A crate is not a jail; it's a bedroom. It keeps them safe and aids potty training.

### Steps
1. **Make it comfortable**: Add soft bedding and safe toys.
2. **Open Door Policy**: Toss treats inside and let the dog enter and exit freely. Do not close the door yet.
3. **Feeding**: Feed meals near the crate, then inside with the door open.
4. **Short Closures**: Give a stuffed Kong, close the door for 1 second, treat, open.
5. **Build Duration**: Gradually increase time. Always wait for a moment of silence before opening the door.

### Troubleshooting
* **Whining**: If they whine, wait for a pause before letting them out. Letting them out while whining rewards the noise.
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 20,
        tags: ['crate-training', 'puppy', 'safety', 'anxiety-prevention'],
        video_url: 'https://www.youtube.com/watch?v=n4Uf6W0yK28', // Simpawtico - Crate Training
        species_info: [{ species: PetSpecies.DOG, suitability: 'Recommended for most dogs.' }],
      },
      {
        title: 'Sit',
        summary: 'The most basic command for impulse control.',
        content_markdown: `
### Lure and Reward
1. Hold a treat near the dog's nose.
2. Slowly move your hand up and back over their head.
3. As their head goes up, their butt will naturally go down.
4. The moment the butt hits the floor, mark ("Yes!" or Click) and give the treat.
5. Repeat 10-15 times.

### Adding the Cue
1. Once the dog is reliably following the lure, say "Sit" *before* you move your hand.
2. Gradually reduce the hand movement until a small signal works.
        `,
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 5,
        tags: ['obedience', 'basics', 'impulse-control'],
        video_url: 'https://www.youtube.com/watch?v=Edwn2l86Rgo', // Zak George - Teach Sit
        species_info: [{ species: PetSpecies.DOG, suitability: 'All dogs.' }],
      },
      {
        title: 'Down',
        summary: 'Teaching your dog to lie down on command.',
        content_markdown: `
### The Lure
1. Start with the dog in a **Sit**.
2. Hold a treat near their nose and slowly lower it straight down to the floor between their paws.
3. If they stand up, start over.
4. Once their nose is down, slowly slide the treat along the floor *away* from them.
5. When elbows touch the ground, mark and reward.

### Pro Tip
* Do not push on the dog's back. Let them figure it out.
* Use a high-value treat to keep their nose glued to your hand.
        `,
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 10,
        tags: ['obedience', 'basics', 'calmness'],
        video_url: 'https://www.youtube.com/watch?v=vk4k9xX0Krs', // Kikopup - Teach Down
        species_info: [{ species: PetSpecies.DOG, suitability: 'All dogs.' }],
      },
      {
        title: 'Stay',
        summary: 'Building duration and impulse control.',
        content_markdown: `
### The 3 D's: Duration, Distance, Distraction
Start with Duration.

### Steps
1. Ask for a **Sit** or **Down**.
2. Hold a hand up like a stop sign. Say "Stay".
3. Wait **1 second**.
4. Mark ("Yes") and give a treat. Release ("Okay!").
5. Gradually increase time: 2s, 5s, 10s.
6. **Distance**: Take one step back, return immediately, reward.
7. **Distraction**: Wave an arm, return, reward.

### Rules
* Always return to the dog to give the treat (don't call them out of a stay yet).
* If they break the stay, gently reset them and try a shorter time.
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 15,
        tags: ['obedience', 'safety', 'control'],
        video_url: 'https://www.youtube.com/watch?v=ksBLWye3an8', // Zak George - Stay
        species_info: [{ species: PetSpecies.DOG, suitability: 'All dogs.' }],
      },
      {
        title: 'Recall (Come)',
        summary: 'The most important safety command.',
        content_markdown: `
### The Name Game
1. Say your dog's name.
2. When they look at you, mark ("Yes!") and toss a treat.
3. Repeat until they whip their head around every time.

### The Come Command
1. Have a partner hold the dog, or wait till they are distracted.
2. Run *away* from the dog while clapping and making happy noises.
3. Say "Come!" (once!).
4. When they catch you, throw a party (lots of treats/play).

### Rules
* **Never** punish your dog when they come to you, even if they were naughty before.
* **Never** call your dog for something unpleasant (bath, vet). Go get them instead.
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 15,
        tags: ['safety', 'recall', 'essential'],
        video_url: 'https://www.youtube.com/watch?v=rJDp7_rYhLU', // McCann - Recall
        species_info: [{ species: PetSpecies.DOG, suitability: 'Critical for all dogs.' }],
      },
       {
        title: 'Loose Leash Walking',
        summary: 'Teaching your dog to walk politely without pulling.',
        content_markdown: `
### The Concept
The leash is not a steering wheel. We want the dog to choose to be near us.

### Steps
1. Start indoors or in a boring driveway.
2. Treat heavily for being at your side (the "reinforcement zone").
3. **Red Light, Green Light**: The moment the leash goes tight, stop moving.
4. Wait for the dog to look back or step back to loosen the leash.
5. Mark and move forward ("Let's Go").

### Tools
* Use a front-clip harness to reduce pulling leverage safely.
* Avoid retractable leashes during training.
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 20,
        tags: ['walking', 'manners', 'daily-life'],
        video_url: 'https://www.youtube.com/watch?v=sFgtqgiAKoQ', // Kikopup - Loose Leash
        species_info: [{ species: PetSpecies.DOG, suitability: 'All dogs.' }],
      },
    ];

    const dogAdvanced: ActivityData[] = [
      {
        title: 'Leave It',
        summary: 'Ignoring tempting items on command.',
        content_markdown: `
### Step 1: It's in the Hand
1. Put a treat in a closed fist. Present it to the dog.
2. Let them sniff/lick. Say nothing.
3. When they pull away for a split second, mark and reward with a *different* treat from the other hand.

### Step 2: Open Hand
1. Place treat on open palm.
2. If they dive for it, close fist.
3. Wait for them to back off.
4. Cue "Leave It".

### Step 3: The Floor
1. Place treat on floor covered by your foot.
2. Wait for eye contact.
3. Mark and reward (from hand, never the floor treat).
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 15,
        tags: ['safety', 'impulse-control', 'obedience'],
        video_url: 'https://www.youtube.com/watch?v=pEeS2dPpPtA', // Zak George - Leave It
        species_info: [{ species: PetSpecies.DOG, suitability: 'All dogs.' }],
      },
      {
        title: 'Drop It',
        summary: 'Releasing items from the mouth.',
        content_markdown: `
### Trade Game
1. Give dog a low-value toy.
2. Present a high-value treat right at their nose.
3. As they drop the toy to eat, say "Drop It".
4. While they eat, hide the toy or throw it for them to get again (reward is the game continuing).

### Tug Rules
1. Play tug.
2. Stop moving your hand (make the toy "dead").
3. Wait for them to let go.
4. Say "Drop" as they release.
5. Reward by saying "Take it" and resuming play.
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 15,
        tags: ['safety', 'play', 'obedience'],
        video_url: 'https://www.youtube.com/watch?v=ndTiVOCNY4M', // Kikopup - Drop It
        species_info: [{ species: PetSpecies.DOG, suitability: 'All dogs.' }],
      },
      {
        title: 'Place / Go to Bed',
        summary: 'Sending the dog to a specific spot and relaxing.',
        content_markdown: `
### Shaping the Place
1. Lure dog onto a raised bed or mat.
2. Reward heavily for standing/sitting on it.
3. Add cue "Place".
4. Ask for a "Down" once on the mat.
5. Focus on **Duration**: Feed treats periodically to keep them there.

### Usage
* Use when guests arrive (prevents jumping).
* Use during dinner time (prevents begging).
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 20,
        tags: ['manners', 'control', 'calmness'],
        video_url: 'https://www.youtube.com/watch?v=OIGq_5r0DeE', // Zak George - Place
        species_info: [{ species: PetSpecies.DOG, suitability: 'All dogs.' }],
      },
      {
        title: 'Heel',
        summary: 'Precision walking with attention.',
        content_markdown: `
### Luring the Position
1. Hold treat in left hand at your side.
2. Lure dog to stand close to your left leg.
3. Take one step. If dog stays with you, reward.

### Adding Complexity
1. Add turns and changes of pace.
2. The dog's shoulder should remain aligned with your leg.
3. This is a high-concentration exercise; keep sessions short.
        `,
        difficulty: ActivityDifficulty.ADVANCED,
        avg_duration_minutes: 20,
        tags: ['obedience', 'competition', 'advanced'],
        video_url: 'https://www.youtube.com/watch?v=QtOaC03J754', // Kikopup - Heel
        species_info: [{ species: PetSpecies.DOG, suitability: 'Advanced dogs.' }],
      },
      {
        title: 'Leash Reactivity: Look at That',
        summary: 'Changing emotional response to triggers (other dogs, cars).',
        content_markdown: `
### The Setup
Find a distance where your dog sees the trigger but is not barking/lunging (Under Threshold).

### The Game
1. Dog looks at trigger.
2. You immediately click/mark "Yes!".
3. Dog turns to you for treat.
4. Repeat.

### The Goal
"When I see a scary dog, I look at my human for a treat." We are changing the association from "Threat" to "Predictor of Cheese".
        `,
        difficulty: ActivityDifficulty.ADVANCED,
        avg_duration_minutes: 20,
        tags: ['behavior', 'reactivity', 'fear-free'],
        video_url: 'https://www.youtube.com/watch?v=EdraNF2hcgA', // McDevitt - LAT Game
        species_info: [{ species: PetSpecies.DOG, suitability: 'Reactive dogs.' }],
      },
      {
        title: 'Muzzle Training',
        summary: 'Desensitizing to a muzzle for safety and vet visits.',
        content_markdown: `
### Why Muzzle?
Muzzles keep dogs and vets safe. A muzzle-trained dog is less stressed when wearing one.

### Steps
1. **Appearance**: Show muzzle -> Treat. Hide muzzle. Repeat.
2. **Targeting**: Put peanut butter inside. Let dog lick it out. Do not strap it on.
3. **Duration**: Dog holds nose in for 5-10 seconds to get treats.
4. **Straps**: Briefly lift straps behind ears, treat, release.
5. **Fasten**: Fasten loosely, treat generously, remove immediately.
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 15,
        tags: ['safety', 'husbandry', 'vet-prep'],
        video_url: 'https://www.youtube.com/watch?v=KJTucFnmAbw', // Muzzle Up Project
        species_info: [{ species: PetSpecies.DOG, suitability: 'All dogs.' }],
      },
    ];

    const catTraining: ActivityData[] = [
      {
        title: 'Litter Box Best Practices',
        summary: 'Ensuring perfect litter habits.',
        content_markdown: `
### The Setup
* **Rule of Thumb**: One box per cat, plus one extra.
* **Location**: Quiet, low traffic, away from food/water.
* **Size**: 1.5x the length of the cat.

### Maintenance
* Scoop daily.
* Full wash and change monthly.
* Use unscented, clumping litter (most cats prefer this).

### Troubleshooting
* If the cat stops using the box, see a vet immediately. It is often a UTI, not "spite".
        `,
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 5,
        tags: ['hygiene', 'behavior', 'cat-essential'],
        video_url: 'https://www.youtube.com/watch?v=adriZE_noYg', // Jackson Galaxy - Litter Box
        species_info: [{ species: PetSpecies.CAT, suitability: 'All cats.' }],
      },
      {
        title: 'Introduction to Clicker Training (Cat)',
        summary: 'Communicating clearly with your cat.',
        content_markdown: `
### Charging the Clicker
1. Sit with your cat and high-value treats (tuna, freeze-dried chicken).
2. Click -> Treat.
3. Repeat 20 times.
4. Cat learns: "Click means food is coming!"

### Targeting
1. Hold a target stick (or chopstick) near nose.
2. Cat sniffs -> Click -> Treat.
3. Move stick slightly.
4. Cat moves to sniff -> Click -> Treat.
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 10,
        tags: ['clicker', 'enrichment', 'bonding'],
        video_url: 'https://www.youtube.com/watch?v=Oq3Ym7r_f1k', // Cat School - Clicker
        species_info: [{ species: PetSpecies.CAT, suitability: 'Food motivated cats.' }],
      },
      {
        title: 'Carrier Training: The Safe Space',
        summary: 'Making the carrier a happy place.',
        content_markdown: `
### The Environment
1. Leave the carrier out 24/7 with a comfy blanket.
2. Take the door off initially.

### Feeding
1. Feed treats near the carrier.
2. Gradually move bowl inside the carrier.
3. Once comfortable, put the door back on.
4. Practice closing the door for seconds while they eat.

### Travel
Go for short car rides that end back at home with treats, so the carrier doesn't always equal "Vet".
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 15,
        tags: ['husbandry', 'stress-reduction', 'travel'],
        video_url: 'https://www.youtube.com/watch?v=pD4wMhfVvF8', // Jackson Galaxy - Carrier
        species_info: [{ species: PetSpecies.CAT, suitability: 'All cats.' }],
      },
      {
        title: 'Stop Counter Surfing',
        summary: 'Keeping cats off kitchen counters.',
        content_markdown: `
### The "No" is not enough; Provide a "Yes"
1. Cats seek height. Provide a cat tree or shelf *near* the counter.
2. Reward heavily when they are on the "Yes" spot (Cat tree).
3. Make the counter boring: Keep food stored away, wipe crumbs.
4. Use double-sided tape or aluminum foil temporarily as a deterrent.

### The Concept
We are redirecting the natural instinct to climb to an appropriate location.
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 10,
        tags: ['behavior', 'management', 'home'],
        video_url: 'https://www.youtube.com/watch?v=Wf6vVd8r02k', // Jackson Galaxy - Counters
        species_info: [{ species: PetSpecies.CAT, suitability: 'All cats.' }],
      },
      {
        title: 'Nail Trimming (Cat)',
        summary: 'Low-stress pedicure.',
        content_markdown: `
### Preparation
Get cat used to paw handling when relaxed.

### The Cut
1. Gently press the pad to extend the claw.
2. Identify the "quick" (the pink part). **Do not cut this.**
3. Trim just the sharp white tip.
4. Do one nail -> Treat -> Release.
5. Build up to doing a whole paw over time.
        `,
        difficulty: ActivityDifficulty.ADVANCED,
        avg_duration_minutes: 10,
        tags: ['grooming', 'husbandry', 'care'],
        video_url: 'https://www.youtube.com/watch?v=o1XisXyragM', // Helpful Vancouver Vet - Nails
        species_info: [{ species: PetSpecies.CAT, suitability: 'All cats.' }],
      },
      {
        title: 'Play Therapy',
        summary: 'Reducing aggression and boredom through play.',
        content_markdown: `
### Hunt, Catch, Kill, Eat, Sleep
Replicate the predatory cycle.

### Steps
1. Use a wand toy to mimic prey (bird/mouse movements).
2. Let the cat "catch" the toy occasionally to build confidence.
3. Wind down the play (slower movements).
4. **Feed a meal** immediately after play.
5. This leads to the "Groom and Sleep" phase.

### Frequency
Play for 15-20 mins daily to reduce behavioral issues.
        `,
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 20,
        tags: ['behavior', 'enrichment', 'exercise'],
        video_url: 'https://www.youtube.com/watch?v=tq7ZgC0q0gM', // Jackson Galaxy - Play
        species_info: [{ species: PetSpecies.CAT, suitability: 'Indoor cats.' }],
      },
    ];

    const tricksAndFun: ActivityData[] = [
      {
        title: 'Shake / High Five',
        summary: 'A classic trick for dogs and cats.',
        content_markdown: `
### Steps
1. Have a treat in your closed fist.
2. Hold it near the pet's chest/paw level.
3. They will sniff, then eventually paw at your hand.
4. **Click** the moment paw touches hand. Open hand to give treat.
5. Repeat.
6. Add verbal cue "Shake" or "High Five".
7. Switch to open palm signal.
        `,
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 10,
        tags: ['tricks', 'fun', 'bonding'],
        video_url: 'https://www.youtube.com/watch?v=Rg6Tf5lXfME', // Zak George - Shake
        species_info: [
          { species: PetSpecies.DOG, suitability: 'All dogs.' },
          { species: PetSpecies.CAT, suitability: 'Food motivated cats.' },
        ],
      },
      {
        title: 'Spin',
        summary: 'Turning in a circle.',
        content_markdown: `
### Luring
1. Hold treat at nose level.
2. Lure the head towards the tail in a tight circle.
3. Pet will follow the nose.
4. Mark and reward upon completing the circle.

### Fading the Lure
1. Make the hand motion without the treat (treat in other hand).
2. Gradually make the circle gesture smaller and higher.
        `,
        difficulty: ActivityDifficulty.EASY,
        avg_duration_minutes: 5,
        tags: ['tricks', 'fun', 'body-awareness'],
        video_url: 'https://www.youtube.com/watch?v=PjK_P8QvKVM', // Kikopup - Spin
        species_info: [
          { species: PetSpecies.DOG, suitability: 'All dogs.' },
          { species: PetSpecies.CAT, suitability: 'Agile cats.' },
        ],
      },
      {
        title: 'Roll Over',
        summary: 'A fun party trick.',
        content_markdown: `
### Steps
1. Start with pet in a **Down**.
2. Hold treat at nose, move it towards shoulder, then towards backbone.
3. Pet should shift weight to hip.
4. Continue lure over the back so they flop over.
5. Mark and reward.

### Troubleshooting
If they stand up, start the lure lower and slower.
        `,
        difficulty: ActivityDifficulty.MODERATE,
        avg_duration_minutes: 15,
        tags: ['tricks', 'fun'],
        video_url: 'https://www.youtube.com/watch?v=5N2q9bW791k', // Zak George - Roll Over
        species_info: [
          { species: PetSpecies.DOG, suitability: 'Healthy dogs.' },
        ],
      },
    ];

    const allActivities = [...dogBasics, ...dogAdvanced, ...catTraining, ...tricksAndFun];

    for (const activityData of allActivities) {
      const { species_info, ...itemData } = activityData;
      const activity = this.activityRepo.create({
        ...itemData,
        hash: this.createHash(activityData.title),
      });
      const savedActivity = await this.activityRepo.save(activity);

      if (species_info) {
        for (const info of species_info) {
          const speciesData = this.activitySpeciesRepo.create({
            ...info,
            activity: savedActivity,
          });
          await this.activitySpeciesRepo.save(speciesData);
        }
      }
    }
  }
}
