const express = require('express');
const router = express.Router();
const User = require('../models/candidate');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

const checkAdminRole = async(userID)=>{
    try{
        const user = await User.findById(userID);
        return user.role === 'admin';
    }
    catch(err){
        return false;
    }
}
//Post route to add a candidate
router.post('/',jwtAuthMiddleware,async (req,res) => {
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(404).json({message: 'user has not admin role'});
        
       const data = req.user;//assuming the request body contains the candidate data
       
       //create a new user document using mongoose model
       const  newcandidate = new Candidate(data);
        
       //Save the new user to the database
       const response = await newcandidate.save();
       console.log('data saved');
       res.status(200).json({response:response});
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.put('/:candidateID',async (req,res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(404).json({message: 'user has not admin role'});

        const candidateID = req.params.candidateID;//extract the id from the url parameter
        const updatedCandidateData = req.body;//update data for the person

        const response = await Person.findByAndUpdate(candidateID, updatedCandidateData,{
            new:true,//return the updated document
            runValidators:true,//Run mongoose validation
        })

        if(!response){
            return res.status(404).json({error:'Candidate not found'});
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

router.delete('/:candidateID',async (req,res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message: 'user oes not have admin role'});

        const candidateID = req.params.candidateID;//extract the id from the url parameter

        const response = await Person.findByIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({error:'Candidate not found'});
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})
module.exports = router;