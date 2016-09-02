var mongoose = require('mongoose');

var residentContactSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    primaryPhoneNumber: {type: String},
    secondaryPhoneNumber: {type: String},
    email: {type: String},
    physicalAddress: {type: String},
    primaryContact: {type: Boolean, default: false},
    relation: {type: String},
    contactNotes: {type: String},

    // automatic
    submitBy: {type: String, required: true},
    submitDate: {type: Date, default: Date.now}
});

var residentSchema = new mongoose.Schema({

    // administrative information ----------------------------------------------------------
    // identifier
    firstName: {type: String, required: true},
    aliasName: {type: String},
    middleName: {type: String},
    lastName: {type: String, required: true},
    room: {type: Number},
    birthDate: {type: Date, required: true},
    admissionDate: {type: Date},
    sex: {type: String, required: true}, // male, female, other
      maidenName: {type: String}, // if female | open field

    // location
    buildingStatus: {type: String, required: true}, // in the building, hospital, rehad, dead, moved out
      movedOutDescribe: {type: String}, // conditional if moved out selected | open field
      movedOutTo: {type: String}, // conditional if moved out is selected | Nursing Home, Home, Another AL
    movedFrom: {
      name: {type: String},
      longitude: {type: Number},
      latitude: {type: Number}
    },

    // random
    assessmentInterval: {type: String},  // weekly, monthly, quarterly, yearly, none
    fullCode: {type: Boolean},
    primaryDoctor: {type: String},
    pharmacy: {type: String},
    residentContact: [residentContactSchema],
    administrativeNotes: {type: String},

    // automatic
    carePoints: {type: Number},
    updateInfo: [mongoose.Schema.Types.Mixed],
    submitDate: {type: Date, default: Date.now},
    submitBy: {type: String, required: true},
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    },

    // life information ----------------------------------------------------------
    // personal informative
    religion: {type: String},
    education: {type: String},
    occupation: {type: String},
    contribution: {type: String},

    // outside agency
    outsideAgency: {type: String}, // hospice, homehealth, home care, social worker, private duty, other (select one)
    outsideAgencyFile: [String], // upload the outside agencys assessment

    // accessories
    heatingPad: {type: Boolean},
    microwave: {type: Boolean},
    extensionCord: {type: Boolean},
      accessorySafetyAssessment: {type: String, default: "Assessed for Safety"}, // if yes to heating pad, microwave, extension cord | autofill to say "Assessed for Safety"

    lifeNotes: {type: String},

    // bathing information ----------------------------------------------------------
    typeOfBathing: {type: String}, // shower, tub, spit bath
    timeOfBathing: {type: String}, // morning, evening, before breakfast, after breakfast, after supper, before supper?
    frequencyOfBathing: {type: Number}, // scale of 0-7.  0 being none.  7 being everyday (7 days a week)
    acceptanceOfBathing: {type: String}, // likes, dislikes, refuses
      dislikesBathingDescribe: {type: String}, // if dislikes or refuses is selected | open field
    bathingNotes: {type: String},

    // mobility information ----------------------------------------------------------
    insideApartment: {
        useOfAssistiveDevice: {type: String}, // walker, cane, wheelchair, electric wheelchair, no device
        assitanceWithDevice: {type: String},
        specialAmbulationNeeds: {type: String},

        // devices
        transferPole: {type: Boolean, default: false},
        liftReclinerChair: {type: Boolean, default: false},
        transferLift: {type: Boolean, default: false},
        sideRails: {type: Boolean, default: false},
          mobilitySafetyAssessment: {type: String, default: "Assessed for Safety"},  // if yes to side rails, transfer pole, transfer lift: autofill to say "Assessed for Safety"
    },
    outsideApartment: {
        useOfAssistiveDevice: {type: String}, // walker, cane, wheelchair, electric wheelchair, no device
        assitanceWithDevice: {type: String},
        specialAmbulationNeeds: {type: String},
    },
    transfers: {type: String}, // standby, independent, full assist, transfer pole, gait belt
    fallRisk: {type: Boolean, default: false},
      fallRiskDescribe: {type: String}, // if yes is selected | physical limitations, modication challenges, cognition, choice
    bedReposition: {type: Boolean, default: false},
      bedRepositionExplain: {type: String},
      bedRepositionOutsideAgency: {type: String},
    twoPersonLift: {type: Boolean, default: false},
    mobilityNotes: {type: String},

    // allergy information ----------------------------------------------------------
    hasFoodAllergies: {type: Boolean, default: false},
      foodAllergies: [String], // if yes is selected
    hasMedicationAllergies: {type: Boolean, default: false},
      medicationAllergies: [String], // if yes is selected
    otherAllergies: [String], // not putting boolean conditional here because I dont like it and it may die also with foods and meds
    allergyNotes: {type: String},

    // sleep information ----------------------------------------------------------
    usualBedtime: {type: String}, // early evening, late evening, other
    usualArisingTime: {type: String}, // early morning, mid morning, late morning, other
    nap: {type: Boolean, default: false},
      napDescribe: {type: String}, // if yes | open field
    assistanceToBed: {type: String}, // medication, positioning, pillows, drink, alcohol, hot tea, warm milk
    sleepsThroughNight: {type: Boolean, default: false},
      canCallForAssistance: {type: Boolean, default: false}, // if no | pop up for regular checks
    sleepNotes: {type: String},


    // continent information (reword frontend to call it 'incontinent') ----------------------------------------------------------
    continentIndependent: {type: Boolean, default: false},

      // if continentIndependent is true, assume full continents
      colostomy: {type: Boolean, default: false},
        bowelContinent: {type: String}, // always, sometimes, never
      constipated: {type: String}, // always, sometimes, never
      laxative: {type: String}, // always, sometimes, never
      urostomy: {type: Boolean, default: false},
        bladderContinent: {type: String}, // always, sometimes, never
      dribbles: {type: String}, // always, sometimes, never
      catheter: {type: Boolean, default: false}, // always, sometimes, never
        catheterDescribe: {type: String}, // if yes | open field
      toiletingDevice: {type: String}, // urinal, seat riser, bedside commode, none, bars around toilet

    continentNotes: {type: String},

    // nutrition information ----------------------------------------------------------
    overallNutrition: {type: Number}, // scale between 0-3 | 0 = not eating, 1 = poor, 2 = good, 3 = over eating
      poorNutritionDescribe: {type: String}, // if not eating, poor, or over eating | shake, bedtime snack, resident choice (add more options)
    diabetic: {type: Boolean, default: false},
      diabeticType: {type: String}, // if yes | diet controlled, medication controlled, insulin controlled
      bloodSugarMonitoring: {type: Boolean, default: false}, // if yes | regular, sometimes, daily
    bedtimeSnack: {type: Boolean, default: false},
    adaptiveEquipment: {type: String}, // plate guard, built up silverware, special cups, none
    needsFoodInSmallPeices: {type: Boolean, default: false},
    typeOfDiet: {type: String}, // pureed, ground, regular, soft
    foodLikes: [String],
    foodDislikes: [String],
    fingerFoods: {type: Boolean, default: false},
    nutritionNotes: {type: String},

    // physical condition information ----------------------------------------------------------
    // skin
    skinCondition: {type: String}, // hydrated, dry, grey, ashen, jaundice, clammy, pale, normal
    hasWound: {type: Boolean, default: false}, // only if the wound needs dressing
      hasWoundDescribe: {type: String}, // if yes | open field
      woundAmount: {type: Number}, // if yes | number of wounds
    skinBreakdown: {type: Boolean, default: false}, // "At risk for skin breakdown"

    // infection
    urinaryTractInfectionRisk: {type: Boolean, default: false},
    upperRespiratoryInfectionRisk: {type: Boolean, default: false},
    methicillinResistantStaphylococcusAureusRisk: {type: Boolean, default: false}, // "MRSA"
    vancomycinResistantEnterococcusRisk: {type: Boolean, default: false}, // "VRE"
    shinglesRisk: {type: Boolean, default: false},
    pneumoniaRisk: {type: Boolean, default: false},

    // hearing
    rightEar: {type: String}, // adequate, adequate with aid, poor
    leftEar: {type: String}, // adequate, adequate with aid, poor
    hearingAbility: {type: Number}, // number scale 0 through 10 | just display numerical value
    wearsHearingAid: {type: Boolean, default: false},
      helpWithHearingAid: {type: Boolean, default: false}, // if yes | yes/no
        helpWithHearingAidDescribe: {type: String}, // if yes | open field
    hearingNotes: {type: String},

    // vision
    visionAssistance: {type: String}, // glasses, contacts, none
    rightEye: {type: String}, // adequate, adequate with aid, poor
    leftEye: {type: String}, // adequate, adequate with aid, poor
    visionAbility: {type: Number}, // number scale 0 through 10
    visionNotes: {type: String},

    // teeth
    dentistName: {type: String},
    upperDentureFit: {type: Boolean, default: false},
      upperDentureFitDescribe: {type: String}, // if no | open field
    upperTeeth: {type: String}, // Has own, Has dentures, has partial
    lowerDentureFit: {type: Boolean, default: false},
      lowerDentureFitDescribe: {type: String}, // if no | open field
    lowerTeeth: {type: String}, // Has own, Has dentures, has partial
    teethCondition: {type: Number}, // number scale 0 through 10

    // oxygen
    oxygen: {type: Boolean, default: false},

    // medication
    medsAtBedside: {type: Boolean, default: false},
    selfMeds: {type: Boolean, default: false},
    meds: {type: Boolean, default: false},

    physicalNotes: {type: String},


    // psychosocial information ----------------------------------------------------------
    // mental state
    psychosocialStatus: [String], // check all that apply: alert, friendly, disoriented, withdrawn, lonely, happy, confused, uncooperative
    psychosocialStatusDescribe: {type: String},
    comprehension: {type: Number}, // scale from 0 - 2 | slow = 0, moderate = 1, quick = 2
    dementia: {type: Number}, // scale from  0 - 3 | none = 0, mild = 1, moderate = 2, severe = 3
    sunDowner: {type: Boolean},
      sunDownerExplain: {type: String}, // if yes | open field
    wanderer: {type: Boolean}, // "Leaves without Intention"
    highMaintenance: {type: Boolean, default: false},
    anxiety: {type: Boolean, default: false},
      antipsychoticMeds: {type: Boolean, default: false}, // if yes |

    // habits
    smokes: {type: Boolean, default: false},
      smokesDescribe: {type: String}, // if yes | open field
    alcohol: {type: Boolean, default: false},
      alcoholDescribes: {type: String}, // if yes | open field
    sexualActive: {type: Boolean, default: false},
      sexualActiveDescribe: {type: String}, // if yes | open field
    otherHabits: {type: String},

    // participation
    generalActivityParticipation: {type: Number}, // scale 0 - 3 | never = 0, sometimes = 1, good = 2, amazing = 3
    diningRoomParticipation: {type: Number}, // scale 0 - 3 | never = 0, sometimes = 1, good = 2, amazing = 3
    busRideParticipation: {type: Number}, // scale 0 - 3 | never = 0, sometimes = 1, good = 2, amazing = 3 "bus rides/trips"
    fitnessClassParticipation: {type: Number}, // scale 0 - 3 | never = 0, sometimes = 1, good = 2, amazing = 3
    bingoParticipation: {type: Number}, // scale 0 - 3 | never = 0, sometimes = 1, good = 2, amazing = 3
    communityParticipation: {type: Number}, // scale 0 - 3 | never = 0, sometimes = 1, good = 2, amazing = 3
    timeInRoom: {type: String}, // Reading, TV, Game, hobby, computer, radio (select all that apply)
    preferedActivites: {type: String}, // open field

    // car
    drivesCar: {type: Boolean, default: false},
      licensePlateNumber: {type: Number}, // if yes | numberic field
      spareKeyLocation: {type: String}, // if yes | open field
      drivingNeeds: {type: String}, // if yes | open field

    // random
    useFitnessEquipmentIndependently: {type: Boolean, default: false},
    familyInvolvement: {type: String}, // none, some, frequent
    psychosocialNotes: {type: String},


    // pain information ----------------------------------------------------------
    hasPain: {type: Boolean, default: false},
      painSeverity: {type: Number}, // if yes | scale of 0 - 10, display numerical value
      painLocation: {type: String}, // if yes |
      painDescription: {type: String}, // if yes |
      maxPainTime: {type: String}, // if yes |
      painIncreasedBy: {type: String}, // if yes |
      painDecreasedBy: {type: String}, // if yes |
      painManagedBy: {type: String}, // medication, hot pack, cold pack, positioning, topicals (check all that apply)
      painLength: {type: String}, // new onset, chronic
    painNotes: {type: String},

    // vitals information ----------------------------------------------------------
    temperature: [vitalsInfoSchema],
    weight: [vitalsInfoSchema],
    bloodPressureSystolic: [vitalsInfoSchema],
    bloodPressureDiastolic: [vitalsInfoSchema],
    oxygenSaturation: [vitalsInfoSchema],
    pulse: [vitalsInfoSchema],
    vitalsPain: [vitalsInfoSchema],
    respiration: [vitalsInfoSchema],
    tracksINR: {type: Boolean, default: false},
      howOftenINR: {type: String}, // if yes | daily, weekly, monthly, yearly
      byWhomINR: {type: String}, // if yes | self, clinic, outside agency
      internationalNormalizedRatio: [vitalsInfoSchema], // if yes | array of values
});


var vitalsInfoSchema = new mongoose.Schema({
    data: {type: Number, required: true},
    date: {type: Date, 'default': Date.now},
});

mongoose.model('Resident', residentSchema);
