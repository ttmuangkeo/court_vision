const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Convert inches to feet and inches format
function inchesToFeetInches(inches) {
  if (!inches || isNaN(inches)) return null;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}' ${remainingInches}"`;
}

// Convert feet/inches string to inches
function feetInchesToInches(feetInches) {
  if (!feetInches || typeof feetInches !== 'string') return null;
  
  // Handle formats like "6' 6"", "6'6"", "6' 6", "6'6"
  const match = feetInches.match(/(\d+)'?\s*(\d+)"/);
  if (match) {
    const feet = parseInt(match[1]);
    const inches = parseInt(match[2]);
    return feet * 12 + inches;
  }
  
  // Handle just feet like "6'"
  const feetMatch = feetInches.match(/(\d+)'/);
  if (feetMatch) {
    return parseInt(feetMatch[1]) * 12;
  }
  
  return null;
}

// Convert weight to display format
function weightToDisplay(weight) {
  if (!weight || isNaN(weight)) return null;
  return `${weight} lbs`;
}

// Parse display weight to numeric
function displayWeightToNumeric(displayWeight) {
  if (!displayWeight || typeof displayWeight !== 'string') return null;
  
  // Handle formats like "230 lbs", "230lbs", "230"
  const match = displayWeight.match(/(\d+)\s*lbs?/i);
  if (match) {
    return parseInt(match[1]);
  }
  
  // Handle just numbers
  const numMatch = displayWeight.match(/(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1]);
  }
  
  return null;
}

async function consolidateHeightWeightFields() {
  console.log('🔄 Starting height and weight field consolidation...\n');
  
  const players = await prisma.player.findMany({
    select: {
      espnId: true,
      name: true,
      height: true,
      weight: true,
      displayHeight: true,
      displayWeight: true
    }
  });

  let heightUpdated = 0;
  let weightUpdated = 0;
  let heightSkipped = 0;
  let weightSkipped = 0;
  let heightFailed = 0;
  let weightFailed = 0;

  for (const player of players) {
    const updateData = {};
    let needsUpdate = false;

    // Handle height consolidation
    if (!player.displayHeight && player.height) {
      let newDisplayHeight = null;
      
      // If height is numeric (inches), convert to feet/inches
      if (!isNaN(player.height)) {
        newDisplayHeight = inchesToFeetInches(parseInt(player.height));
      } 
      // If height is already in feet/inches format, use as is
      else if (typeof player.height === 'string' && player.height.includes("'")) {
        newDisplayHeight = player.height;
      }
      
      if (newDisplayHeight) {
        updateData.displayHeight = newDisplayHeight;
        heightUpdated++;
        needsUpdate = true;
      } else {
        heightFailed++;
      }
    } else if (player.displayHeight) {
      heightSkipped++;
    }

    // Handle weight consolidation
    if (!player.displayWeight && player.weight) {
      const newDisplayWeight = weightToDisplay(player.weight);
      if (newDisplayWeight) {
        updateData.displayWeight = newDisplayWeight;
        weightUpdated++;
        needsUpdate = true;
      } else {
        weightFailed++;
      }
    } else if (player.displayWeight) {
      weightSkipped++;
    }

    if (needsUpdate) {
      try {
        await prisma.player.update({
          where: { espnId: player.espnId },
          data: updateData
        });
        
        if (updateData.displayHeight) {
          console.log(`  ✅ Height: ${player.name} (${player.espnId}): ${player.height} → ${updateData.displayHeight}`);
        }
        if (updateData.displayWeight) {
          console.log(`  ✅ Weight: ${player.name} (${player.espnId}): ${player.weight} → ${updateData.displayWeight}`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to update ${player.name} (${player.espnId}):`, error.message);
        if (updateData.displayHeight) heightFailed++;
        if (updateData.displayWeight) weightFailed++;
      }
    }
  }

  // Get final stats
  const totalPlayers = await prisma.player.count();
  const withDisplayHeight = await prisma.player.count({
    where: { displayHeight: { not: null } }
  });
  const withDisplayWeight = await prisma.player.count({
    where: { displayWeight: { not: null } }
  });

  console.log('\n📊 Height and Weight Field Consolidation Summary:');
  console.log(`✅ Height updated: ${heightUpdated}`);
  console.log(`✅ Weight updated: ${weightUpdated}`);
  console.log(`⏭️  Height skipped (already had displayHeight): ${heightSkipped}`);
  console.log(`⏭️  Weight skipped (already had displayWeight): ${weightSkipped}`);
  console.log(`❌ Height failed: ${heightFailed}`);
  console.log(`❌ Weight failed: ${weightFailed}`);
  console.log(`📈 Total players: ${totalPlayers}`);
  console.log(`📈 Players with displayHeight: ${withDisplayHeight} (${Math.round((withDisplayHeight/totalPlayers)*100)}%)`);
  console.log(`📈 Players with displayWeight: ${withDisplayWeight} (${Math.round((withDisplayWeight/totalPlayers)*100)}%)`);
}

consolidateHeightWeightFields()
  .then(() => {
    console.log('\n✅ Height and weight consolidation completed!');
    console.log('\nNext steps:');
    console.log('1. Verify the data looks correct');
    console.log('2. Update your sync services to only use displayHeight/displayWeight');
    console.log('3. Create a migration to remove the height/weight fields');
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 