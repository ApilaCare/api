var jsPDF = require('node-jspdf');


module.exports.exportCarePlan = function(data) {

      var doc = jsPDF('p', 'pt', 'letter');
      var fileName = data.firstName + ' ' + data.lastName + '.pdf';

      // date config
      var residentBirthDate = new Date(data.birthDate);
      var residentAdmissionDate = new Date(data.admissionDate);
      // var dateFilter = $filter('date');
      // var residentFilteredBirthDate = dateFilter(residentBirthDate, 'MMM d, yyyy');
      // var residentFilteredAdmissionDate = dateFilter(residentAdmissionDate, 'MMM d, yyyy');

      var arrayLengthOffset = 0;
      var adminOffset = 250;

      if (data.insideApartment === undefined) {
        data.insideApartment = {};
      }

      if (data.outApartment === undefined) {
        data.outApartment = {};
      }

      // font setup
      doc.setFontSize(10);
      doc.setTextColor(33, 33, 33);
      doc.setFont("courier");
      doc.setFontType("bold");
      doc.setLineWidth(25);

      // address line
      doc.setDrawColor(236, 239, 241);
      doc.line(0, 25, 650, 25);
      doc.text(14, 28, "ADDRESS");
      doc.text(300, 28, "3407 Carroll St Alamosa CO, 81101");

      // phone line
      doc.setDrawColor(207, 216, 220);
      doc.line(0, 50, 650, 50);
      doc.text(25, 53, "PHONE");
      doc.text(300, 53, "(719) 587-3514");

      // fax line
      doc.setDrawColor(176, 190, 197);
      doc.line(0, 75, 650, 75);
      doc.text(36, 78, "FAX");
      doc.text(300, 78, "(719) 589-3614");

      // web line
      doc.setDrawColor(144, 164, 174);
      doc.line(0, 100, 650, 100);
      doc.text(37, 103, "WEB");
      doc.text(300, 103, "AlamosaBridge.com");

      // allergy
      doc.setDrawColor(0, 150, 136);
      doc.line(0, 150, 650, 150);
      doc.text(300, 153, "ALLERGY");

      if (data.hasFoodAllergies === true || data.hasMedicationAllergies === true) {

        arrayLengthOffset = 174;

        if (data.hasFoodAllergies === true) {
          doc.text(295, arrayLengthOffset, "Food Allergies:");
          doc.text(430, arrayLengthOffset, data.foodAllergies);
          arrayLengthOffset = (data.foodAllergies.length * 12) + arrayLengthOffset;
        }

        if (data.hasMedicationAllergies === true) {
          doc.text(295, arrayLengthOffset, "Medication Allergies:");
          doc.text(430, arrayLengthOffset, data.medicationAllergies);
          arrayLengthOffset = (data.medicationAllergies.length * 12) + arrayLengthOffset;
        }

        arrayLengthOffset = arrayLengthOffset + 25;

      } else {
        doc.text(295, 174, data.firstName + " has no known allergies");
        arrayLengthOffset = 174 + 35;
      }

      // bathing line
      doc.setDrawColor(3, 169, 244);
      doc.line(0, arrayLengthOffset, 650, arrayLengthOffset);
      doc.text(300, arrayLengthOffset + 3, "BATHING");

      doc.text(295, arrayLengthOffset + 24, "Type:");
      doc.text(430, arrayLengthOffset + 24, data.typeOfBathing + " ");

      doc.text(295, arrayLengthOffset + 36, "Time:");
      doc.text(430, arrayLengthOffset + 36, data.timeOfBathing + " ");

      doc.text(295, arrayLengthOffset + 48, "Frequency:");
      doc.text(430, arrayLengthOffset + 48, data.frequencyOfBathing + " ");

      arrayLengthOffset = arrayLengthOffset + 60;

      doc.text(295, arrayLengthOffset, "Acceptance:");
      doc.text(430, arrayLengthOffset, data.acceptanceOfBathing + " ");

      if (data.acceptanceOfBathing == "Dislikes") {
        doc.text(295, arrayLengthOffset + 12, "Why Dislikes:");
        doc.text(430, arrayLengthOffset + 12, data.dislikesBathingDescribe + " ");
        arrayLengthOffset = arrayLengthOffset + 12;
      }

      // continent line
      doc.setDrawColor(121, 85, 72);
      doc.line(0, arrayLengthOffset + 38, 650, arrayLengthOffset + 38);
      doc.text(300, arrayLengthOffset + 41, "CONTINENT");

      doc.text(295, arrayLengthOffset + 62, "Bowel Continent:");
      doc.text(430, arrayLengthOffset + 62, data.bowelContinent + " ");

      doc.text(295, arrayLengthOffset + 74, "Constipated:");
      doc.text(430, arrayLengthOffset + 74, data.constipated + " ");

      doc.text(295, arrayLengthOffset + 86, "Laxative:");
      doc.text(430, arrayLengthOffset + 86, data.laxative + " ");

      doc.text(295, arrayLengthOffset + 110, "Bladder Continent:");
      doc.text(430, arrayLengthOffset + 110, data.bladderContinent + " ");

      doc.text(295, arrayLengthOffset + 122, "Dribbles:");
      doc.text(430, arrayLengthOffset + 122, data.dribbles + " ");

      if (data.catheter == true) {
        doc.text(295, arrayLengthOffset + 134, "Catheter Description:");
        doc.text(430, arrayLengthOffset + 134, data.catheterDescribe + " ");
        arrayLengthOffset = arrayLengthOffset + 12;
      }

      arrayLengthOffset = arrayLengthOffset + 134;

      doc.text(295, arrayLengthOffset, "Toileting Device:");
      doc.text(430, arrayLengthOffset, data.toiletingDevice + " ");

      // mobility line
      doc.setDrawColor(255, 235, 59);
      doc.line(0, arrayLengthOffset + 38, 650, arrayLengthOffset + 38);
      doc.text(300, arrayLengthOffset + 41, "MOBILITY");

      doc.text(295, arrayLengthOffset + 62, "Inside Apartment:");
      doc.text(295, arrayLengthOffset + 74, "Use of Assistive Device:");
      doc.text(450, arrayLengthOffset + 74, data.insideApartment.useOfAssistiveDevice + " ");

      doc.text(295, arrayLengthOffset + 86, "Assitance with Device:");
      doc.text(450, arrayLengthOffset + 86, data.insideApartment.assitanceWithDevice + " ");

      doc.text(295, arrayLengthOffset + 98, "Special Ambulation Needs:");
      doc.text(450, arrayLengthOffset + 98, data.insideApartment.specialAmbulationNeeds + " ");

      doc.text(295, arrayLengthOffset + 122, "Outside Apartment:");
      doc.text(295, arrayLengthOffset + 134, "Use of Assistive Device:");
      doc.text(450, arrayLengthOffset + 134, data.toiletingDevice + " ");

      doc.text(295, arrayLengthOffset + 146, "Assitance with Device:");
      doc.text(450, arrayLengthOffset + 146, data.toiletingDevice + " ");

      doc.text(295, arrayLengthOffset + 158, "Special Ambulation Needs:");
      doc.text(450, arrayLengthOffset + 158, data.toiletingDevice + " ");

      doc.text(295, arrayLengthOffset + 182, "Transfers:");
      doc.text(450, arrayLengthOffset + 182, data.transfers + " ");

      if (data.fallRisk == true) {
        doc.text(295, arrayLengthOffset + 194, "Fall Risk Description:");
        doc.text(450, arrayLengthOffset + 194, data.fallRiskDescribe + " ");
        arrayLengthOffset = arrayLengthOffset + 12;
      }

      doc.text(295, arrayLengthOffset + 194, "Bed Reposition:");
      doc.text(450, arrayLengthOffset + 194, data.bedReposition + " ");

      arrayLengthOffset = arrayLengthOffset + 202

      // big vertical line
      doc.setDrawColor(120, 144, 156);
      doc.setLineWidth(220);
      doc.line(180, 0, 180, 800);

      // community title
      // doc.setFontSize(16.6);
      // doc.text(75, 40, data.communityName);

      // logo
      var logoPosX = 55,
        logoPosY = 55;
      var logoWidth = 190,
        logoHeight = 75;
      //doc.addImage(imageData.getImage('transperent_logo'), 'PNG', logoPosX, logoPosY, logoPosX + logoWidth, logoPosY + logoHeight);

      // admin header
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(16.6);
      doc.text(135, 220, "Care Plan");
      doc.text(164, 235, "for");
      doc.text(75, adminOffset, data.firstName);

/*
      if (data.middleName !== "" || data.middleName === undefined) {
        adminOffset = adminOffset + 15;
        doc.text(75, adminOffset, data.middleName + " ");
      } */

      doc.text(75, adminOffset + 15, data.lastName);

      // admin info
      doc.setFontSize(10);

      doc.text(147, adminOffset + 30, "Sex: " + data.sex);
      if (data.sex == "Female") {
        doc.text(99, adminOffset + 30, "Maiden Name: " + data.maidenName);
        adminOffset = adminOffset + 12;
      }
      // doc.text(87, adminOffset + 42, "Date of Birth: " + residentFilteredBirthDate);
      // doc.text(81, adminOffset + 54, "Admission Date: " + residentFilteredAdmissionDate);
      if (data.buildingStatus == "Moved Out") {
        doc.text(87, 42 + adminOffset, "Moved Out: " + movedOutTo);
        doc.text(87, 42 + adminOffset, "Reason: " + movedOutDescribe);
        adminOffset = adminOffset + 24;
      } else {
        doc.text(75, 66 + adminOffset, "Building Status: " + data.buildingStatus);
      }
      doc.text(81, adminOffset + 104, "Story about " + data.firstName + " " + data.lastName);
      doc.text(81, adminOffset + 116, "could go here");

      doc.addPage();
      doc.setLineWidth(25);
      var offset2 = 0;

      // nutrition line
      doc.setDrawColor(139, 195, 74);
      doc.line(0, 25, 650, 25);
      doc.text(300, 28, "NUTRITION");

      doc.text(20, 49, "Overall Nutrition:");
      doc.text(220, 49, data.overallNutrition + " ");

      if (data.overallNutrition == "Poor") {
        doc.text(20, 61, "Poor Nutrition Description:");
        doc.text(220, 61, data.poorNutritionDescribe + " ");
        offset2 = 12;
      }

      if (data.diabetic == true) {
        doc.text(20, 61 + offset2, "Diabetic Type:");
        doc.text(220, 61 + offset2, data.diabeticType + " ");

        doc.text(20, 73 + offset2, "Blood Sugar Monitoring:");
        doc.text(220, 73 + offset2, data.bloodSugarMonitoring + " ");
        offset2 = 12 + offset2;
      } else {
        doc.text(20, 61 + offset2, data.firstName + " is not diabetic");
      }

      doc.text(20, 73 + offset2, "Bedtime Snack:");
      doc.text(220, 73 + offset2, data.bedtimeSnack + " ");

      doc.text(20, 85 + offset2, "Adaptive Equipment:");
      doc.text(220, 85 + offset2, data.adaptiveEquipment + " ");

      doc.text(20, 97 + offset2, "Needs Food in Small Peices:");
      doc.text(220, 97 + offset2, data.needsFoodInSmallPeices + " ");

      doc.text(20, 109 + offset2, "Type of Diet:");
      doc.text(220, 109 + offset2, data.typeOfDiet + " ");

      doc.text(20, 121 + offset2, "Finger Foods:");
      doc.text(220, 121 + offset2, data.fingerFoods + " ");

      if (data.foodLikes.length !== 0) {
        doc.text(20, 133 + offset2, "Food Likes:");
        doc.text(220, 133 + offset2, data.foodLikes);
        doc.text(400, 133 + offset2, "likes length: " + data.foodLikes.length + " | offset2: " + offset2);
        offset2 = (data.foodLikes.length * 12) + offset2;
      }

      if (data.foodDislikes.length !== 0) {
        doc.text(20, 133 + offset2, "Food Dislikes:");
        doc.text(220, 133 + offset2, data.foodDislikes);
        doc.text(400, 133 + offset2, "dislikes length: " + data.foodDislikes.length + " | offset2: " + offset2);
        offset2 = (data.foodDislikes.length * 12) + offset2;
      }

      // pain line
      doc.setDrawColor(244, 67, 54);
      doc.line(0, 159 + offset2, 650, 159 + offset2);
      doc.text(300, 162 + offset2, "PAIN");

      if (data.hasPain == true) {
        doc.text(20, 186 + offset2, "Pain Location:");
        doc.text(220, 186 + offset2, data.painLocation + " ");

        doc.text(20, 198 + offset2, "Pain Description:");
        doc.text(220, 198 + offset2, data.painDescription + " ");

        doc.text(20, 210 + offset2, "Max Pain Time:");
        doc.text(220, 210 + offset2, data.maxPainTime + " ");

        doc.text(20, 222 + offset2, "Pain Increased By:");
        doc.text(220, 222 + offset2, data.painIncreasedBy + " ");

        doc.text(20, 234 + offset2, "Pain Decreased By:");
        doc.text(220, 234 + offset2, data.painDecreasedBy + " ");

        doc.text(20, 246 + offset2, "Pain Managed By:");
        doc.text(220, 246 + offset2, data.painManagedBy + " ");

        doc.text(20, 258 + offset2, "Pain Length:");
        doc.text(220, 258 + offset2, data.painLength + " ");

        offset2 = offset2 + 84;

      } else {
        doc.text(20, 186 + offset2, data.firstName + " has not mentioned pain");
      }

      // physical condition line
      doc.setDrawColor(33, 150, 243);
      doc.line(0, 212 + offset2, 650, 212 + offset2);
      doc.text(300, 215 + offset2, "PHYSICAL");

      doc.text(20, 236 + offset2, "Skin Condition:");
      doc.text(220, 236 + offset2, data.skinCondition + " ");

      if (data.hasWound == true) {
        doc.text(20, 248 + offset2, "Wound Description:");
        doc.text(220, 248 + offset2, data.hasWoundDescribe + " ");

        doc.text(20, 260 + offset2, "Wound Amount:");
        doc.text(220, 260 + offset2, data.woundAmount + " ");

        offset2 = offset2 + 24;
      }

      doc.text(20, 248 + offset2, "Right Ear:");
      doc.text(220, 248 + offset2, data.rightEar + " ");

      doc.text(20, 260 + offset2, "Left Ear:");
      doc.text(220, 260 + offset2, data.leftEar + " ");

      doc.text(20, 272 + offset2, "Hearing Notes:");
      doc.text(220, 272 + offset2, data.hearingNotes + " ");

      if (data.wearsHearingAid == true) {
        if (data.helpWithHearingAid == true) {
          doc.text(20, 284 + offset2, "Hearing Aid Help:");
          doc.text(220, 284 + offset2, data.helpWithHearingAidDescribe + " ");

          offset2 = offset2 + 12;
        }
      }

      doc.text(20, 284 + offset2, "Right Eye:");
      doc.text(220, 284 + offset2, data.rightEye + " ");

      doc.text(20, 296 + offset2, "Left Eye:");
      doc.text(220, 296 + offset2, data.leftEye + " ");

      doc.text(20, 308 + offset2, "Vision Notes:");
      doc.text(220, 308 + offset2, data.visionNotes + " ");

      doc.text(20, 320 + offset2, "Dentist Name:");
      doc.text(220, 320 + offset2, data.dentistName + " ");

      if (data.upperDentureFit == true) {
        doc.text(20, 332 + offset2, "Upper Denture Fit:");
        doc.text(220, 332 + offset2, data.upperDentureFitDescribe + " ");

        offset2 = offset2 + 12;
      }

      doc.text(20, 332 + offset2, "Upper Teeth:");
      doc.text(220, 332 + offset2, data.upperTeeth + " ");

      if (data.lowerDentureFit == true) {
        doc.text(20, 344 + offset2, "Lower Denture Fit:");
        doc.text(220, 344 + offset2, data.lowerDentureFitDescribe + " ");

        offset2 = offset2 + 12;
      }

      doc.text(20, 344 + offset2, "Lower Teeth:");
      doc.text(220, 344 + offset2, data.lowerTeeth + " ");

      doc.text(20, 356 + offset2, "Teeth Condition:");
      doc.text(220, 356 + offset2, data.teethCondition + " ");

      doc.addPage();
      doc.setLineWidth(25);
      var offset3 = 0;

      // psychosocial line
      doc.setDrawColor(156, 39, 176);
      doc.line(0, 25, 650, 25);
      doc.text(300, 28, "PSYCHOSOCIAL");

      if (data.psychosocialStatus.length !== 0) {
        doc.text(20, 49, "Psychosocial Status:");
        doc.text(220, 49, data.psychosocialStatus);
        offset3 = offset3 + (data.psychosocialStatus.length * 12) - 12;
      }

      doc.text(20, 61 + offset3, "Psychosocial Status Description:");
      doc.text(220, 61 + offset3, data.psychosocialStatusDescribe + " ");

      doc.text(20, 73 + offset3, "Comprehension:");
      doc.text(220, 73 + offset3, data.comprehension + " ");

      if (data.smokes == true) {
        doc.text(20, 85 + offset3, "Smokes:");
        doc.text(220, 85 + offset3, data.smokesDescribe);
        offset3 = offset3 + 12;
      }

      if (data.alcohol == true) {
        doc.text(20, 85 + offset3, "Alcohol:");
        doc.text(220, 85 + offset3, data.alcoholDescribes);
        offset3 = offset3 + 12;
      }

      if (data.sexualActive == true) {
        doc.text(20, 85 + offset3, "Sexual Activity:");
        doc.text(220, 85 + offset3, data.sexualActiveDescribe);
        offset3 = offset3 + 12;
      }

      doc.text(20, 85 + offset3, "Other Habits:");
      doc.text(220, 85 + offset3, data.otherHabits + " ");

      doc.text(20, 97 + offset3, "Activity Participation:");
      doc.text(220, 97 + offset3, data.generalActivityParticipation + " ");

      doc.text(20, 109 + offset3, "Dining Room Participation:");
      doc.text(220, 109 + offset3, data.diningRoomParticipation + " ");

      doc.text(20, 121 + offset3, "Bus Ride Participation:");
      doc.text(220, 121 + offset3, data.busRideParticipation + " ");

      doc.text(20, 133 + offset3, "Fitness Class Participation:");
      doc.text(220, 133 + offset3, data.fitnessClassParticipation + " ");

      doc.text(20, 145 + offset3, "Bingo Participation:");
      doc.text(220, 145 + offset3, data.bingoParticipation + " ");

      doc.text(20, 157 + offset3, "Community Participation:");
      doc.text(220, 157 + offset3, data.communityParticipation + " ");

      doc.text(20, 169 + offset3, "Time in Room:");
      doc.text(220, 169 + offset3, data.timeInRoom + " ");

      if (data.drivesCar == true) {
        doc.text(20, 181 + offset3, "License Plate Number:");
        doc.text(220, 181 + offset3, data.licensePlateNumber + " ");

        doc.text(20, 193 + offset3, "Spare Key Location:");
        doc.text(220, 193 + offset3, data.spareKeyLocation);

        doc.text(20, 205 + offset3, "Driving Needs:");
        doc.text(220, 205 + offset3, data.drivingNeeds);

        offset3 = offset3 + 36;
      }

      doc.text(20, 181 + offset3, "Prefered Activites:");
      doc.text(220, 181 + offset3, data.preferedActivites + " ");

      doc.text(20, 193 + offset3, "Uses Fitness Equipment Alone:");
      doc.text(220, 193 + offset3, data.useFitnessEquipmentIndependently + " ");

      doc.text(20, 205 + offset3, "Family Involvement:");
      doc.text(220, 205 + offset3, data.familyInvolvement + " ");

      doc.text(20, 217 + offset3, "High Maintenance:");
      doc.text(220, 217 + offset3, data.highMaintenance + " ");

      // sleep line
      doc.setDrawColor(233, 30, 99);
      doc.line(0, 255 + offset3, 650, 255 + offset3);
      doc.text(300, 258 + offset3, "SLEEP");

      doc.text(20, 279 + offset3, "Usual Bedtime:");
      doc.text(220, 279 + offset3, data.usualBedtime + " ");

      doc.text(20, 291 + offset3, "Usual Arising Time:");
      doc.text(220, 291 + offset3, data.usualArisingTime + " ");

      if (data.nap == true) {
        doc.text(20, 303 + offset3, "Nap Description:");
        doc.text(220, 303 + offset3, data.napDescribe + " ");

        offset3 = offset3 + 12;
      }

      doc.text(20, 303 + offset3, "Assistance to Bed:");
      doc.text(220, 303 + offset3, data.assistanceToBed + " ");

      if (data.sleepsThroughNight == true) {
        doc.text(20, 315 + offset3, "Can Call for Assistance:");
        doc.text(220, 315 + offset3, data.canCallForAssistance + " ");

        offset3 = offset3 + 12;
      }

      doc.addPage();
      doc.setLineWidth(25);
      var offset4 = 0;

      // vitals line
      doc.setDrawColor(205, 220, 57);
      doc.line(0, 25, 650, 25);
      doc.text(300, 28, "VITALS");

      doc.text(50, 100, "Temperature");
      doc.addImage(data.temperature, 'PNG', 50, 120, 150, 150);
      //
      // doc.text(210, 100, "Blood Pressure ");
      // doc.addImage(data.bloodCanvas, 'PNG', 250, 120, 150, 150);
      //
      // doc.text(410, 100, "Respiration");
      // doc.addImage(data.resp, 'PNG', 410, 120, 150, 150);
      //
      //
      // doc.text(50, 300, "Oxygen Saturation");
      // doc.addImage(data.oxygen, 'PNG', 50, 320, 150, 150);
      //
      // doc.text(210, 300, "Pulse");
      // doc.addImage(data.pulse, 'PNG', 250, 320, 150, 150);
      //
      // doc.text(410, 300, "Pain");
      // doc.addImage(data.vitals, 'PNG', 410, 320, 150, 150);

      doc.save(fileName);
};
