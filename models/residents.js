var mongoose = require('mongoose');

var residentSchema = new mongoose.Schema({

    // administrative information
    firstName: {type: String, required: true},
    aliasName: {type: String},
    middleName: {type: String},
    lastName: {type: String, required: true},
    birthDate: {type: Date, required: true},
    admissionDate: {type: Date},
    sex: {type: String, required: true}, // male, female, other
      maidenName: {type: String}, // if female | open field
    buildingStatus: {type: String, required: true}, // in the building, hospital, rehad, dead, moved out
      movedOutDescribe: {type: String}, // conditional if moved out selected | open field
      movedOutTo: {type: String}, // conditional if moved out is selected | Nursing Home, Home, Another AL
    movedFrom: {
      name: {type: String},
      longitude: {type: Number},
      latitude: {type: Number}
    },
    updateInfo: [mongoose.Schema.Types.Mixed],
    submitDate: {type: Date, default: Date.now},
    submitBy: {type: String, required: true},
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    },

    // life information
    religion: {type: String},
    education: {type: String},
    occupation: {type: String},

    // bathing information
    typeOfBathing: {type: String}, // shower, tub, spit bath
    timeOfBathing: {type: String}, // morning, evening, before breakfast, after breakfast, after supper, before supper?
    frequencyOfBathing: {type: String}, // 1 per week, twice a week, everyday, outside agency
    acceptanceOfBathing: {type: String}, // likes, dislikes
      dislikesBathingDescribe: {type: String}, // if dislikes is selected | open field

    // mobility information
    insideApartment: {
        useOfAssistiveDevice: {type: String}, // walker, cane, wheelchair, electric wheelchair, no device
        assitanceWithDevice: {type: String},
        specialAmbulationNeeds: {type: String},
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

    // allergy information
    hasFoodAllergies: {type: Boolean, default: false},
      foodAllergies: [String], // if yes is selected
    hasMedicationAllergies: {type: Boolean, default: false},
      medicationAllergies: [String], // if yes is selected

    // sleep information
    usualBedtime: {type: String}, // early evening, late evening, other
    usualArisingTime: {type: String}, // early morning, mid morning, late morning, other
    nap: {type: Boolean, default: false},
      napDescribe: {type: String}, // if yes | open field
    assistanceToBed: {type: String}, // medication, positioning, pillows, drink, alcohol, hot tea, warm milk
    sleepsThroughNight: {type: Boolean, default: false},
      canCallForAssistance: {type: Boolean, default: false}, // if no | pop up for regular checks


    // continent information
    bowelContinent: {type: String}, // always, sometimes, never, colostomy
    constipated: {type: String}, // always, sometimes, never
    laxative: {type: String}, // always, sometimes, never
    bladderContinent: {type: String}, // always, sometimes, never, colostomy
    dribbles: {type: String}, // always, sometimes, never
    catheter: {type: Boolean, default: false}, // always, sometimes, never
      catheterDescribe: {type: String}, // if yes | open field
    toiletingDevice: {type: String}, // urnal, seat riser, bedside comod, none

    // nutrition information
    overallNutrition: {type: String}, // good, poor
      poorNutritionDescribe: {type: String}, // if poor | shake, bedtime snack, resident choice
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

    // physical condition information
    skinCondition: {type: String}, // hydrated, dry
    hasWound: {type: Boolean, default: false},
      hasWoundDescribe: {type: String}, // if yes | open field
      woundAmount: {type: Number}, // if yes | number of wounds

    rightEar: {type: String}, // adequate, adequate with aid, poor
    leftEar: {type: String}, // adequate, adequate with aid, poor
    hearingNotes: {type: String},
    wearsHearingAid: {type: Boolean, default: false},
      helpWithHearingAid: {type: Boolean, default: false}, // if yes | yes/no
        helpWithHearingAidDescribe: {type: String}, // if yes | open field

    visionAssistance: {type: String}, // glasses, contacts, none
    rightEye: {type: String}, // adequate, adequate with aid, poor
    leftEye: {type: String}, // adequate, adequate with aid, poor
    visionNotes: {type: String},

    dentistName: {type: String},
    upperDentureFit: {type: Boolean, default: false},
      upperDentureFitDescribe: {type: String}, // if no | open field
    upperTeeth: {type: String}, // Has own, Has dentures, has partial
    lowerDentureFit: {type: Boolean, default: false},
      lowerDentureFitDescribe: {type: String}, // if no | open field
    lowerTeeth: {type: String}, // Has own, Has dentures, has partial
    teethCondition: {type: String}, // poor, fair, good, excellent

    // psychosocial information
    psychosocialStatus: [String], // check all that apply: alert, friendly, disoriented, withdrawn, lonely, happy, confused, uncooperative
    psychosocialStatusDescribe: {type: String},
    comprehension: {type: String}, // slow, moderate, quick
    smokes: {type: Boolean, default: false},
      smokesDescribe: {type: String}, // if yes | open field
    alcohol: {type: Boolean, default: false},
      alcoholDescribes: {type: String}, // if yes | open field
    sexualActive: {type: Boolean, default: false},
      sexualActiveDescribe: {type: String}, // if yes | open field
    otherHabits: {type: String},
    generalActivityParticipation: {type: String},
    diningRoomParticipation: {type: String}, // none, minor, amazing
    busRideParticipation: {type: String}, // none, minor, amazing
    fitnessClassParticipation: {type: String}, // none, minor, amazing
    bingoParticipation: {type: String}, // none, minor, amazing
    communityParticipation: {type: String}, // none, minor, amazing
    timeInRoom: {type: String}, // Reading, TV, Game, hobby, computer, radio
    drivesCar: {type: Boolean, default: false},
      licensePlateNumber: {type: Number}, // if yes | numberic field
      spareKeyLocation: {type: String}, // if yes | open field
      drivingNeeds: {type: String}, // if yes | open field
    preferedActivites: {type: String}, // walks,
    useFitnessEquipmentIndependently: {type: Boolean, default: false},
    familyInvolvement: {type: String}, // none, some, frequent
    highMaintenance: {type: Boolean, default: false},

    // pain information
    hasPain: {type: Boolean, default: false},
      painLocation: {type: String}, // if yes |
      painDescription: {type: String}, // if yes |
      maxPainTime: {type: String}, // if yes |
      painIncreasedBy: {type: String}, // if yes |
      painDecreasedBy: {type: String}, // if yes |
      painManagedBy: {type: String}, // medication, hot pack, cold pack, positioning, topicals
      painLength: {type: String}, // new onset, chronic

    // vitals information
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
    date: {type: Date, "default": Date.now},
});

mongoose.model('Resident', residentSchema);
