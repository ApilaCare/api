var mongoose = require('mongoose');

var residentContactSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    primaryPhoneNumber: {type: String},
    secondaryPhoneNumber: {type: String},
    email: {type: String},
    physicalAddress: {type: String},
    primaryContact: {type: Boolean, default: false},
    trustedPerson: {type: Boolean, default: false},
    relation: {type: String},
    medicalPowerOfAttorney: {type: Boolean, default: false},
    financialPowerOfAttorney: {type: Boolean, default: false},
    conservator: {type: Boolean, default: false},
    guardian: {type: Boolean, default: false},
    contactNotes: {type: String},

    // automatic
    submitBy: {type: String, required: true},
    submitDate: {type: Date, default: Date.now}
});

var updateInfoSchema = new mongoose.Schema({
  updateBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  updateDate: {type: Date, default: Date.now},
  updateField: [mongoose.Schema.Types.Mixed]
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
    maritalStatus: {type: String}, // single, divorced, widowed, married, single never married
    veteran: {type: Boolean, default: false},

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
    assessmentInterval: {type: Number},  // scale 0-4 | weekly, monthly, quarterly, yearly, none
    fullCode: {type: Boolean, default: false},
    primaryDoctor: {type: String},
    pharmacy: {type: String},
    longTermCareInsurance: {type: Boolean, default: false},
    receiveingLongTermCareInsurance: {type: Boolean, default: false},
    handlesFinances: {type: String}, // _id of contact sub document
    appointmentCoordination: {type: String}, // self, needs assistance, family
    residentContact: [residentContactSchema],
    communicatedWithResident: {type: Boolean, default: false},
    communicatedWithPrimaryContact: {type: Boolean, default: false},
    communicatedWithTrustedPerson: {type: Boolean, default: false},
    administrativeNotes: {type: String},

    // automatic
    carePoints: {type: Number},
    updateInfo: [updateInfoSchema],
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
    shopping: [String], // family, self, friend (check all that apply)

    // outside agency
    outsideAgency: {type: String}, // hospice, homehealth, home care, social worker, private duty, other (select one)
    outsideAgencyFile: {type: String}, // upload the outside agencys assessment

    // speech
    easilyUnderstood: {type: Boolean, default: false},
    englishFirstLanguage: {type: Boolean, default: false},
    otherLanguage: {type: String}, //

    // accessories
    heatingPad: {type: Boolean},
    microwave: {type: Boolean},
    extensionCord: {type: Boolean},
      accessorySafetyAssessment: {type: String, default: "Assessed for Safety"}, // if yes to heating pad, microwave, extension cord | autofill to say "Assessed for Safety"

    lifeNotes: {type: String},

    // bathing information ----------------------------------------------------------
    typeOfBathing: {type: String}, // shower, tub, spit bath
    timeOfBathing: {type: String}, // morning, evening, before breakfast, after breakfast, after supper, before supper?
    frequencyOfBathing: {type: Number}, // scale of 0-4 | none, once a week, twice a week, every other day, every day
    acceptanceOfBathing: {type: String}, // likes, dislikes, refuses
      dislikesBathingDescribe: {type: String}, // if dislikes or refuses is selected | open field
    bathingAssist: {type: String}, // full assistance, standby, independent, partial assistance
    bathingNotes: {type: String},

    // mobility information ----------------------------------------------------------
    insideApartment: {
        useOfAssistiveDevice: {type: String}, // walker, cane, wheelchair, electric wheelchair, no device, other
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
        useOfAssistiveDevice: {type: String}, // walker, cane, wheelchair, electric wheelchair, no device, other
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
      // bowel
      colostomy: {type: Boolean, default: false},
        bowelContinent: {type: Number}, // scale 0 - 2 | always, sometimes, never
      constipated: {type: Number}, // scale 0 - 2 | always, sometimes, never
      laxative: {type: Number}, // scale 0 - 2 | always, sometimes, never

      // bladder
      urostomy: {type: Boolean, default: false},
        bladderContinent: {type: Number}, // scale 0 - 2 | always, sometimes, neverscale 0 - 2 | always, sometimes, never
      dribbles: {type: Number}, // scale 0 - 2 | always, sometimes, never
      catheter: {type: Boolean, default: false},
        catheterDescribe: {type: String}, // if yes | open field

      // assistance
      incontinentApparel: {type: Boolean, default: false},
        incontinentApparelAssist: {type: String}, // if yes | independent, standby, partial, full
      toiletTransfer: {type: String}, // independent, standby, partial assitance, full assistance
      toiletingDevice: {type: String}, // urinal, seat riser, bedside commode, none, bars around toilet
      toiletingAssist: {type: String}, // independent, reminder, partial assistance, full assistance
      toiletingReminder: {type: Boolean, default: false},

    continentNotes: {type: String},

    // nutrition information ----------------------------------------------------------
    overallNutrition: {type: Number}, // scale between 0-3 | 0 = not eating, 1 = poor, 2 = good, 3 = over eating
      poorNutritionDescribe: {type: String}, // if not eating, poor, or over eating | shake, bedtime snack, resident choice (add more options)
    diabetic: {type: Boolean, default: false},
      diabeticType: {type: String}, // if yes | diet controlled, medication controlled, insulin controlled
      bloodSugarMonitoring: {type: Boolean, default: false}, // if yes |
    bedtimeSnack: {type: Boolean, default: false},
    adaptiveEquipment: {type: String}, // plate guard, built up silverware, special cups, none
    needsFoodInSmallPeices: {type: Boolean, default: false},
    typeOfDiet: {type: String}, // pureed, ground, regular, soft
    foodLikes: [String],
    foodDislikes: [String],
    fingerFoods: {type: Boolean, default: false},
    feedAssist: {type: String}, // independent, standby, partial assistance, full assistance
    foodInRoom: {type: Boolean, default: false},
    drinkInRoom: {type: Boolean, default: false},
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
    hearingAssist: {type: String}, // full, independent, reminder

    // vision
    visionAssistance: {type: String}, // glasses, contacts, none
    rightEye: {type: String}, // adequate, adequate with aid, poor
    leftEye: {type: String}, // adequate, adequate with aid, poor
    visionAbility: {type: Number}, // number scale 0 through 10
    visionNotes: {type: String},
    visionAssist: {type: String}, // full, independent, reminder

    // teeth
    dentistName: {type: String},
    upperDentureFit: {type: Boolean, default: false},
      upperDentureFitDescribe: {type: String}, // if no | open field
    upperTeeth: {type: String}, // Has own, Has dentures, has partial
    lowerDentureFit: {type: Boolean, default: false},
      lowerDentureFitDescribe: {type: String}, // if no | open field
    lowerTeeth: {type: String}, // Has own, Has dentures, has partial
    teethCondition: {type: Number}, // number scale 0 through 10
    teethAssist: {type: String}, // full, independent, reminder

    // oxygen
    oxygen: {type: Boolean, default: false},

    // medication
    medsAtBedside: {type: Boolean, default: false},
    selfMeds: {type: Boolean, default: false},
    meds: {type: Boolean, default: false},
    swallowAssist: {type: Boolean, default: false},
    chemotherapy: {type: Boolean, default: false},
    dialysis: {type: Boolean, default: false},
    marijuana: {type: Boolean, default: false},

    physicalNotes: {type: String},


    // assistance -------------------------------------------------------------------
    // hair
    hairAssist: {type: Boolean, default: false},
    barber: {type: Boolean, default: false},
    shaveAssist: {type: String}, // independent, standby, partial, full
    hairNotes: {type: String},

    // nails
    fingerNailsAssist: {type: String}, // independent, full
    toeNailsAssist: {type: String}, // independent, full

    // accessories
    makeupAssist: {type: String}, // independent, partial, full, standby
    jewelryAssist: {type: String}, // independent, partial, full, standby
    lotionAssist: {type: String}, // independent, partial, full, reminder

    // dressing
    layoutCloths: {type: Boolean, default: false},
    shoesAssist: {type: Boolean, default: false},
    topAssist: {type: Boolean, default: false},
    bottomAssist: {type: Boolean, default: false},
    buttonAssist: {type: Boolean, default: false},
    zipperAssist: {type: Boolean, default: false},
    dressingNotes: {type: String},

    // devices
    compressionStockingsAssist: {type: Boolean, default: false},
    brace: {type: Boolean, default: false},
      braceAssist: {type: Boolean, default: false}, // if yes |
      braceDescribe: {type: String}, // if yes |

    // night time routine
    bedAssist: {type: String}, // independent, full assist, partial assist, stand by


    // psychosocial information ----------------------------------------------------------
    // mental state
    psychosocialStatus: [String], // check all that apply:
                                  // alert, friendly, disoriented, withdrawn, talkative
                                  // lonely, happy, confused, uncooperative, at times angry, sad,
                                  // emotional outbursts, feel like a burden
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
      alcoholInRoom: {type: Boolean, default: false}, // if yes |
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
    timeInRoom: {type: String}, // Reading, TV, Game, hobby, computer, radio, audio books (select all that apply)
    volunteer: {type: Boolean, default: false},
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
      painManagedBy: [String], // medication, hot pack, cold pack, positioning, topicals (check all that apply)
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
